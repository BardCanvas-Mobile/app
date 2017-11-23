
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
        var sel = '.' + position;
        
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
                var markup   = $('#navbar_selector_component').html();
                var template = Template7.compile(markup);
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
        
        var sel = '.' + position;
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
    
    renderFeed: function($container, website, service, data)
    {
        var items = data.data;
        
        if( items.length === 0 )
        {
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
        
        var $collection = $(sprintf('<div class="feed-contents" data-type="%s"></div>', type));
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
            
            var isEditor  = currentUserLevel >= BCuserLevels.Editor;
            var isOwnItem = currentUserName === itemAuthorUserName;
            var context   = {
                item:     item,
                service:  service,
                website:  website,
                manifest: manifest,
                flags:    {
                    isEditor:          isEditor,
                    isOwnItem:         isOwnItem,
                    showUserDetails:   isEditor && ! isOwnItem,
                    showAdminControls: isEditor && ! isOwnItem
                }
            };
            
            var markup   = $('body').find(sprintf('template[data-type="%s"]', type)).html();
            var template = Template7.compile(markup);
            var html     = template(context);
            var $card    = $(html);
            
            $card.data('context', context);
            $card.data('website', website);
            $card.data('service', service);
            $card.data('manifest', manifest);
            $card.find('.card-header, .card-content').bind('click', function()
            {
                BChtmlHelper.renderFeedItemPage( $(this) );
            });
            
            $collection.append($card);
        }
        
        $container.html('').append($collection);
        
        // var manifest  = BCmanifestsRepository.getForWebsite(website.URL);
        // var context   = { website: website, service: service, manifest: manifest, url: url };
        // var template  = Template7.compile(html);
        // $container.html( template(context) );
        // $container.attr('data-initialized', 'true');
        
        var pageId = '#' + $container.closest('.service-page').attr('id');
        BCapp.framework.initImagesLazyLoad( pageId );
        console.log( 'Lazy load triggered on ' + pageId );
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
        var rawDate;
        var itemAuthorLevel = parseInt(item.author_level);
        
        rawDate = BCtoolbox.convertRemoteDate(item.publishing_date, manifest.timezoneOffset);
        if( service.options.showAuthors )
        {
            item._publishedCaption = sprintf(
                BClanguage.feeds.publishedCaption.full,
                item.author_display_name,
                moment(rawDate).format(BClanguage.dateFormats.short),
                moment(rawDate).fromNow()
            );
        }
        else
        {
            item._publishedCaption = sprintf(
                BClanguage.feeds.publishedCaption.simple,
                moment(rawDate).format(BClanguage.dateFormats.short),
                moment(rawDate).fromNow()
            );
        }
        
        item._altPublishedCaption = sprintf(
            BClanguage.feeds.publishedCaption.simple,
            moment(rawDate).format(BClanguage.dateFormats.short),
            moment(rawDate).fromNow()
        );
        
        item._levelCaption = sprintf(
            BClanguage.userLevelCaption, itemAuthorLevel, manifest.userLevels[itemAuthorLevel]
        );
        
        item._levelOnlyCaption = manifest.userLevels[itemAuthorLevel];
        
        rawDate = BCtoolbox.convertRemoteDate(item.author_creation_date, manifest.timezoneOffset);
        item._memberSinceCaption = sprintf(
            BClanguage.userMemberSince,
            moment(rawDate).format(BClanguage.dateFormats.shorter),
            moment(rawDate).fromNow()
        );
        
        item.featured_image_path      = BCapp.forgeServiceURL(service, website, item.featured_image_path);
        item.featured_image_thumbnail = BCapp.forgeServiceURL(service, website, item.featured_image_thumbnail);
        
        item._mainCategoryCaption = item.main_category_title;
        if( item.parent_category_title )
            item._mainCategoryCaption = item.parent_category_title + '/' + item._mainCategoryCaption;
        
        item._hasComments = item.comments_count > 0;
        
        return item;
    },
    
    renderFeedItemPage: function( $trigger )
    {
        var $card    = $trigger.closest('.card');
        var context  = $card.data('context');
        var website  = $card.data('website');
        var service  = $card.data('service');
        var manifest = $card.data('manifest');
        var markup   = $('body').find('template[data-type="single_item_page"]').html();
        var template = Template7.compile(markup);
        var $html    = $(template(context));
        var view     = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
        
        $html.find('.convert-to-full-date').each(function()
        {
            var $this   = $(this);
            var val     = $this.text();
            var rawDate = BCtoolbox.convertRemoteDate(val, manifest.timezoneOffset);
            var repl    = moment(rawDate).format(BClanguage.dateFormats.shorter)
                        + ' (' + moment(rawDate).fromNow() + ')';
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
        
        // console.log(context);
        view.router.loadContent($html);
    }
};
