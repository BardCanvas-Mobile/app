
var BChtmlHelper = {
    
    convertIcon: function(source)
    {
        // iOS,Android
        if( source.indexOf(',') >= 0 )
        {
            var parts = source.split(',');
            
            return sprintf('<i class="bc-ios-icon icon f7-icons">%s</i>', parts[0]) +
                   sprintf('<i class="bc-android-icon icon fa %s"></i>',  parts[1]);
        }
        
        if( source.indexOf('data:') === 0 )
        {
            return sprintf('<img src="%s">', source);
        }
        
        if( source.indexOf('http') === 0 )
        {
            if( BCapp.imgCacheEnabled )
            {
                ImgCache.isCached(source, function(path, success)
                {
                    if ( ! success) ImgCache.cacheFile(source);
                });
            }
            
            return sprintf('<img src="%s">', source);
        }
        
        if( source.indexOf('fa') === 0 )
        {
            return sprintf('<i class="icon fa %s"></i>', source);
        }
        
        return source;
    },
    
    /**
     *
     * @param {jQuery} $bar
     * @param {string} position
     * @param {object} helper
     * @param {string} containerId
     */
    createNavbarSelector: function($bar, position, helper, containerId)
    {
        var data    = window.tmpServiceFeeds[containerId];
        var params  = data.params;
        var website = data.website;
        var service = data.service;
        
        var url = BCapp.forgeServiceURL(service, website, helper.contentsProvider);
        var sel = '.' + position + ' .target';
        
        console.log('Prepping provider fetchig for helper ', helper);
        console.log('Fetching provider data:', url);
        $bar.find(sel).html('<span class="preloader"></span>');
        $.getJSON(url, params, function(data)
        {
            window.tmpHelpersLoaded++;
            
            if( data.message !== 'OK' )
            {
                var $item  = '<i class="fa fa-warning fa-fw color-red"></i>';
                var wsName = BCmanifestsRepository.getForWebsite(website.URL).shortName;
                $item.bind('click', function() {
                    BCapp.framework.alert(data.message, wsName);
                });
                
                $bar.find(sel).html('').append($item);
                
                return;
            }
            
            var componentId = sprintf(
                '%s-%s-%s-selector',
                website.handler.replace(/\./g, ''),
                website.userName,
                service.id
            );
            
            var item = data.data[0];
            var $a   = $('<a class="link page-selector"></a>');
            $a.attr('id',           componentId);
            $a.data('containerId',  containerId);
            $a.data('selectedItem', item.id);
            $a.data('paramName',    helper.paramName);
            $a.data('items',        data.data);
            $a.bind('click', function()
            {
                var $this       = $(this);
                var containerId = $this.data('containerId');
                var data        = window.tmpServiceFeeds[containerId];
                var params      = data.params;
                var website     = data.website;
                var service     = data.service;
                var view        = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
                var items       = $this.data('items');
                
                var sanitizedItems = [];
                for(var i in items)
                {
                    var item = items[i];
                    sanitizedItems[sanitizedItems.length] = {
                        id:          '' + item.id,
                        caption:     '' + item.caption.replace(/"/g, '&quot;'),
                        description: '' + item.description
                    };
                }
    
                var context  = {componentId: componentId, items: sanitizedItems};
                var template = BCapp.getCompiledTemplate('#navbar_selector_component');
                var html     = template(context);
                
                BCapp.framework.popup(html, true);
            });
            $a.html(sprintf(
                '<span class="item">%s</span> %s%s',
                item.caption,
                '<i class="bc-ios-icon icon f7-icons">chevron_right</i>',
                '<i class="bc-android-icon fa fa-chevron-right"></i>'
            ));
            $bar.find(sel).html('').append($a);
            $bar.find('.preloader').fadeOut('fast');
        })
        .fail(function($xhr, status, error)
        {
            var $item  = '<i class="fa fa-warning fa-fw color-red"></i>';
            var wsName = BCmanifestsRepository.getForWebsite(website.URL).shortName;
            $item.bind('click', function() {
                BCapp.framework.alert(error, wsName);
            });
            
            $bar.find(sel).html('').append($item);
            $bar.find('.preloader').fadeOut('fast');
        });
    },
    
    /**
     * @param {jQuery} $bar
     * @param {string} position
     * @param {object} helper
     * @param {string} containerId
     */
    createNavbarSearchHelper: function($bar, position, helper, containerId)
    {
        window.tmpHelpersLoaded++;
        
        var sel = '.' + position + ' .target';
        var $a  = $('<a class="link disabled search-trigger icon-only"></a>');
        $a.data('containerId',  containerId);
        $a.bind('click', function()
        {
            var $this       = $(this);
            var containerId = $this.data('containerId');
            var data        = window.tmpServiceFeeds[containerId];
            var params      = data.params;
            var website     = data.website;
            var service     = data.service;
            var view        = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
            
            // console.log(view);
            // console.log(data);
        });
        $a.html(sprintf(
            '%s%s',
            '<i class="bc-ios-icon icon f7-icons">search</i>',
            '<i class="bc-android-icon fa fa-search"></i>'
        ));
        $bar.find(sel).html('').append($a);
        $bar.find('.preloader').fadeOut('fast');
    },
    
    setSelectedItem: function(trigger)
    {
        var $trigger    = $(trigger);
        var componentId = $trigger.attr('data-component-id');
        var itemId      = $trigger.attr('data-item-id');
        var caption     = $trigger.attr('data-caption');
        
        var $a          = $('#' + componentId);
        var containerId = $a.data('containerId');
        var paramName   = $a.data('paramName');
        
        var data        = window.tmpServiceFeeds[containerId];
        var params      = data.params;
        var website     = data.website;
        var service     = data.service;
        var view        = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
        
        console.log(sprintf(
            'Selected item "%s" for "%s", to update "%s" on "%s"', itemId, componentId, paramName, containerId
        ));
        
        $a.data('selectedItem', itemId);
        $a.find('.item').html(caption);
        params[paramName] = itemId;
        console.log('Updated params: ', params);
        
        BCapp.reloadServiceFeed( '#' + containerId );
    },
    
    renderFeed: function($container, website, service, data, appendOrPrepend, scrollToTop)
    {
        if( typeof appendOrPrepend === 'undefined' ) appendOrPrepend = '';
        if( typeof scrollToTop === 'undefined' ) scrollToTop = false;
        
        var items = data.data;
        
        if( items.length === 0 )
        {
            if( appendOrPrepend !== '' )
                BCtoolbox.addNotification(BClanguage.feeds.noMoreItemsAvailable);
            else
                $container.html(
                    '<div class="content-block">' +
                    '    <div class="content-block-inner">' +
                             BClanguage.feeds.empty +
                    '    </div>' +
                    '</div>'
                );
            
            return;
        }
        
        /** @type {string} cards:simple | cards:modern | cards:facebook | media_list */
        var type     = $container.attr('data-feed-type').replace('feed/', '');
        var manifest = BCmanifestsRepository.getForWebsite(website.URL);
        console.log(sprintf('Rendering %s items of type %s', items.length, type));
        // console.log('Service: ',  service);
        // console.log('Website: ',  website);
        // console.log('Manifest: ', manifest);
    
        var $collection = appendOrPrepend === ''
                        ? $(sprintf('<div class="feed-contents" data-type="%s"></div>', type))
                        : $('<div class="temporary-container"></div>');
        for(var i in items)
        {
            var item = BChtmlHelper.__prepareItem(new BCfeedItemClass(items[i]), website, service, manifest);
            
            var itemAuthorUserName = item.author_user_name;
            var currentUserLevel   = 0;
            var currentUserName    = '';
            if( website.meta !== null )
            {
                currentUserLevel = parseInt(website.meta.user_level);
                currentUserName  = website.userName;
            }
    
            item._showCategoryLabel = true;
            if( service.options.showsMultipleCategories )
                if( data.extras )
                    if( data.extras.hideCategoryInCards )
                        item._showCategoryLabel = false;
            
            var context   = {
                item:     item,
                service:  service,
                website:  website,
                manifest: manifest
            };
            
            var template = BCapp.getCompiledTemplate(sprintf('template[data-type="%s"]', type));
            var html     = template(context);
            var $card    = $(html);
            
            $card.data('context',  context);
            $card.data('website',  website);
            $card.data('service',  service);
            $card.data('manifest', manifest);
            $card.find('.card-header, .card-content').bind('click', function()
            {
                BChtmlHelper.renderFeedItemPage( $(this) );
            });
            $card.find('.convert-to-full-date').each(function()
            {
                var $this   = $(this);
                var val     = $this.text();
                var rawDate = BCtoolbox.convertRemoteDate(val, manifest.timezoneOffset);
                var repl    = moment(rawDate).format(BClanguage.dateFormats.shorter)
                            + ' (' + moment(rawDate).fromNow() + ')';
                $this.text(repl);
            });
            $card.find('.convert-to-timeago-date').each(function()
            {
                var $this   = $(this);
                var val     = $this.text();
                var rawDate = BCtoolbox.convertRemoteDate(val, manifest.timezoneOffset);
                var repl    = moment(rawDate).fromNow();
                $this.text(repl);
            });
            
            $collection.append($card);
        }
        
        if( appendOrPrepend === 'append' )
        {
            $collection.find('.card').each(function() {
                $container.find('.feed-contents').append( $(this) );
            });
        }
        else if( appendOrPrepend === 'prepend' )
        {
            $collection.find('.card').each(function() {
                $container.find('.feed-contents').prepend( $(this) );
            });
        }
        else
        {
            $container.html('').append($collection);
            BChtmlHelper.__bindFeedRefreshers($container);
        }
        
        if( scrollToTop ) $container.closest('.service-content').scrollTo(0, 100);
        
        var pageId = '#' + $container.closest('.service-page').attr('id');
        BCapp.framework.initImagesLazyLoad( pageId );
        console.log( 'Lazy load triggered on ' + pageId );
    },
    
    __bindFeedRefreshers: function( $container, forced )
    {
        if( typeof forced === 'undefined' ) forced = false;
        
        var $pageContent  = $container.closest('.page-content');
        var pageContentId = $pageContent.attr('id');
        console.log('> Binding Feed Refreshers on #' + $container.attr('id'));
        
        if( typeof $pageContent.attr('infinite-scroll-attached') === 'undefined' )
            $pageContent.attr('infinite-scroll-attached', 'false');
        
        if( forced ) $pageContent.attr('infinite-scroll-attached', 'false');
        if( $pageContent.attr('infinite-scroll-attached') !== 'true' )
        {
            if( BCapp.os === 'android' )
                $pageContent.find('.bc-feed-refresher .preloader').html(
                    BCapp.framework.params.materialPreloaderHtml
                );
            
            $pageContent.find('.bc-feed-refresher').show();
            BCapp.framework.attachInfiniteScroll('#' + pageContentId);
            $pageContent.on('infinite', function() { BChtmlHelper.__feedPullOldItems($pageContent); });
            $pageContent.attr('infinite-scroll-attached', 'true');
            console.log('> Infinite scroll attached to #' + pageContentId);
        }
        
        if( typeof $pageContent.attr('pull-to-refresh-attached') === 'undefined' )
            $pageContent.attr('pull-to-refresh-attached', 'false');
        
        if( forced ) $pageContent.attr('pull-to-refresh-attached', 'false');
        if( $pageContent.attr('pull-to-refresh-attached') !== 'true' )
        {
            if( BCapp.os === 'android' )
                $pageContent.find('.pull-to-refresh-layer .preloader').html(
                    BCapp.framework.params.materialPreloaderHtml
                );
            
            BCapp.framework.initPullToRefresh('#' + pageContentId);
            $pageContent.on('ptr:refresh', function() { BChtmlHelper.__feedPullNewItems($pageContent); });
            $pageContent.attr('pull-to-refresh-attached', 'true');
            console.log('> Pull-to-refresh attached to #' + pageContentId);
        }
        
        $container.data('refreshing', false);
        $container.data('last_refresh_time', 0);
    },
    
    /**
     *
     * @param {BCfeedItemClass}              item
     * @param {BCwebsiteClass}               website
     * @param {BCwebsiteServiceDetailsClass} service
     * @param {BCwebsiteManifestClass}       manifest
     * 
     * @returns {BCfeedItemClass}
     * @private
     */
    __prepareItem: function(item, website, service, manifest)
    {
        var convertedDate;
        var itemAuthorLevel = parseInt(item.author_level);
        
        convertedDate = BCtoolbox.convertRemoteDate(item.publishing_date, manifest.timezoneOffset);
        if( service.options.showAuthors )
        {
            item._publishedCaption = sprintf(
                BClanguage.feeds.publishedCaption.full,
                item.author_display_name,
                moment(convertedDate).format(BClanguage.dateFormats.short),
                item.publishing_date + ' ' + manifest.timezoneOffset,
                moment(convertedDate).fromNow()
            );
        }
        else
        {
            item._publishedCaption = sprintf(
                BClanguage.feeds.publishedCaption.simple,
                moment(convertedDate).format(BClanguage.dateFormats.short),
                item.publishing_date + ' ' + manifest.timezoneOffset,
                moment(convertedDate).fromNow()
            );
        }
        
        item._altPublishedCaption = sprintf(
            BClanguage.feeds.publishedCaption.simple,
            moment(convertedDate).format(BClanguage.dateFormats.short),
            item.publishing_date + ' ' + manifest.timezoneOffset,
            moment(convertedDate).fromNow()
        );
        
        item._levelOnlyCaption = manifest.userLevels[itemAuthorLevel];
        
        item.featured_image_path      = BCapp.forgeServiceURL(service, website, item.featured_image_path);
        item.featured_image_thumbnail = BCapp.forgeServiceURL(service, website, item.featured_image_thumbnail);
        
        item._mainCategoryCaption = item.main_category_title;
        if( item.parent_category_title )
            item._mainCategoryCaption = item.parent_category_title + '/' + item._mainCategoryCaption;
        
        item._hasComments = item.comments_count > 0;
        
        if( item._hasComments )
            item._commentsForIndex = item.comments.slice(0 - item.comments_limit_for_index);
        
        return item;
    },
    
    renderFeedItemPage: function( $trigger )
    {
        var $card          = $trigger.closest('.card');
        var context        = $card.data('context');
        context.feedPageId = 'feed-item-' + BCtoolbox.wasuuup();
        
        var website  = $card.data('website');
        var service  = $card.data('service');
        var manifest = $card.data('manifest');
        var template = BCapp.getCompiledTemplate('template[data-type="single_item_page"]');
        var $html    = $(template(context));
        var view     = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
        
        $html.find('.item-data-container').data('website',  website);
        $html.find('.item-data-container').data('service',  service);
        $html.find('.item-data-container').data('manifest', manifest);
        
        $html.find('.convert-to-full-date').each(function()
        {
            var $this   = $(this);
            var val     = $this.text();
            var rawDate = BCtoolbox.convertRemoteDate(val, manifest.timezoneOffset);
            var repl    = moment(rawDate).format(BClanguage.dateFormats.shorter)
                        + ' (' + moment(rawDate).fromNow() + ')';
            $this.text(repl);
        });
        
        $html.find('.convert-to-timeago-date').each(function()
        {
            var $this   = $(this);
            var val     = $this.text();
            var rawDate = BCtoolbox.convertRemoteDate(val, manifest.timezoneOffset);
            var repl    = moment(rawDate).fromNow();
            $this.text(repl);
        });
        
        $html.find('article a').each(function()
        {
            var $this = $(this);
            var href  = $this.attr('href');
            if( typeof href === 'undefined' ) return;
            
            if( href.search(/^http/i) >= 0 )
            {
                $this.bind('click', function() {
                    var name = "popup" + BCtoolbox.wasuuup();
                    BCapp.openURLinPopup(href, name);
                });
            }
        });
        
        $html.find('article img[data-media-type="image"]').each(function()
        {
            $(this).bind('click', function()
            {
                var image = $(this)[0];
                BCtoolbox.showPhotoBrowser(image);
            });
        });
        
        if( BCapp.os !== 'ios' )
        {
            $html.find('video').each(function()
            {
                var $this  = $(this);
                var poster = $this.attr('poster');
                var src    = $this.find('source:first').attr('src');
                var html   = sprintf(
                    '<div class="bc-embedded-video" data-video-source="%s"' +
                    '     onclick="BChtmlHelper.playEmbeddedVideo(this)">' +
                    '<img src="%s">' +
                    '</div>',
                    src,
                    poster
                );
                
                $this.replaceWith(html);
            });
        }
        
        var feedPageAfterbackTarget = sprintf('.page[data-page="%s"]', context.feedPageId);
        $(document).on('page:afterback', feedPageAfterbackTarget, function(e)
        {
            setTimeout(function()
            {
                var $view = $(BCapp.currentView.selector);
                
                console.log('>-------------------------------------------------------------------');
                console.log(sprintf(
                    '> Got back from feed item page. Re-attaching lost bindings on children of #%s',
                    $view.attr('id')
                ));
                console.log('>-------------------------------------------------------------------');
                
                $view.find('.bc-service-feed').each(function()
                {
                    var $container = $(this);
                    if( typeof $container.closest('.service-page').attr('data-initialized') === 'undefined' ) return;
                    
                    BChtmlHelper.__bindFeedRefreshers( $container, true );
                    console.log('>-------------------------------------------------------------------');
                });
            }, 100);
        });
        
        console.log('Successfully rendered item page on the next view: ', view);
        view.router.loadContent($html);
    },
    
    playEmbeddedVideo: function( trigger )
    {
        var url = $(trigger).attr('data-video-source');
        console.log('%cTriggered video playing for %s', 'color: purple;', url);
        
        // On an iframe it works!
        window.open(url);
        
        // On an external browser also works!
        // window.openFuncitonBackup(url, '_system');
    },
    
    __feedPullNewItems: function( $container )
    {
        var containerId      = $container.attr('id');
        var currentTimestamp = new Date().getTime() / 1000;
        
        if( typeof $container.data('refreshing') === 'undefined' ) $container.data('refreshing', false);
        if( $container.data('refreshing') )
        {
            BCapp.framework.pullToRefreshDone('#' + containerId);
            
            return;
        }
        
        if( typeof $container.data('last_refresh_time') === 'undefined' ) $container.data('last_refresh_time', 0);
        if( $container.data('last_refresh_time') >= currentTimestamp - 10 )
        {
            BCapp.framework.pullToRefreshDone('#' + containerId);
            
            return;
        }
        
        $container.data('refreshing', true);
        console.log('> Pull to refresh triggered on #' + containerId, $container);
        
        var $firstCard = $container.find('.feed-contents .card:first');
        console.log('> First card on screen: ', $firstCard);
        var firstCardPublishingDate = $firstCard.attr('data-publishing-date');
        
        var $feedServiceContainer = $container.find('.bc-service-feed');
        var feedServiceId         = $feedServiceContainer.attr('id');
        var feedServiceData       = window.tmpServiceFeeds[feedServiceId];
        console.log('> Feed service data: ', feedServiceData);
        
        BChtmlHelper.__fetchFeedItems(
            feedServiceData, firstCardPublishingDate, '', currentTimestamp, $container, $feedServiceContainer, 'prepend',
            function() { BCapp.framework.pullToRefreshDone('#' + containerId); }
        );
    },
    
    __feedPullOldItems: function( $container )
    {
        var containerId      = $container.attr('id');
        var currentTimestamp = new Date().getTime() / 1000;
        
        if( typeof $container.data('refreshing') === 'undefined' ) $container.data('refreshing', false);
        if( $container.data('refreshing') ) return;
        
        if( typeof $container.data('last_refresh_time') === 'undefined' ) $container.data('last_refresh_time', 0);
        if( $container.data('last_refresh_time') >= currentTimestamp - 10 ) return;
        
        $container.data('refreshing', true);
        console.log('> Infinite scroll triggered on #' + containerId, $container);
        
        var $lastCard = $container.find('.feed-contents .card:last');
        console.log('> Last card on screen: ', $lastCard);
        var lastCardPublishingDate = $lastCard.attr('data-publishing-date');
        
        var $feedServiceContainer = $container.find('.bc-service-feed');
        var feedServiceId         = $feedServiceContainer.attr('id');
        var feedServiceData       = window.tmpServiceFeeds[feedServiceId];
        console.log('> Feed service data: ', feedServiceData);
        
        $container.find('.bc-feed-refresher').show();
        $container.scrollTo('max', 100);
        
        BChtmlHelper.__fetchFeedItems(
            feedServiceData, '', lastCardPublishingDate, currentTimestamp, $container, $feedServiceContainer, 'append',
            function() { $container.find('.bc-feed-refresher').hide(); }
        );
    },
    
    __fetchFeedItems: function(
        feedServiceData, since, until, currentTimestamp, $container, $feedServiceContainer, appendOrPrepend, callback
    ) {
        BCtoolbox.showNetworkActivityIndicator();
        
        var url     = feedServiceData.url;
        var params  = feedServiceData.params;
        var website = feedServiceData.website;
        var service = feedServiceData.service;
        
        params.since = since;
        params.until = until;
        
        console.log(sprintf('Fetching %s...', url));
        console.log('Params: ', params);
        
        $.getJSON(url, params, function(data)
        {
            $container.data('last_refresh_time', currentTimestamp);
            BCtoolbox.hideNetworkActivityIndicator();
            
            if( data.message !== 'OK' )
            {
                $container.data('refreshing', false);
                
                BCtoolbox.addNotification(BCapp.getServiceError(
                    BClanguage.errorReceived.title,
                    BClanguage.errorReceived.message,
                    website,
                    service,
                    {url: url, error: data.message}
                ));
                
                if( callback ) callback();
                
                return;
            }
            
            BChtmlHelper.renderFeed($feedServiceContainer, website, service, data, appendOrPrepend, false);
            $container.data('refreshing', false);
            
            if( callback ) callback();
        })
        .fail(function($xhr, status, error)
        {
            $container.data('refreshing', false);
            
            BCtoolbox.addNotification(BCapp.getServiceError(
                BClanguage.failedToLoadService.title,
                BClanguage.failedToLoadService.message,
                website,
                service,
                {url: url, error: error}
            ));
            
            if( callback ) callback();
        });
    }
};