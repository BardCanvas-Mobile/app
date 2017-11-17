
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
        var $a  = $('<a class="link search-trigger icon-only"></a>');
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
    
    renderFeed: function($container, website, service, items)
    {
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
        
        var manifest = BCmanifestsRepository.getForWebsite(website.URL);
        
        /** @type {string} cards:simple | cards:modern | cards:facebook | media_list */
        var type = $container.attr('data-feed-type').replace('feed/', '');
        console.log(sprintf('Rendering %s items of type %s', items.length, type));
        console.log('Service: ',  service);
        console.log('Website: ',  website);
        console.log('Manifest: ', manifest);
        
        var $collection = $('<div class="feed-contents"></div>');
        for(var i in items)
        {
            var item = items[i];
            var rawDate;
            
            rawDate = BCtoolbox.convertRemoteDate(item.publishing_date, manifest.timezoneOffset);
            item.publishing_date = moment(rawDate).format(BClanguage.dateFormats.short)
                                 + ' (' + moment(rawDate).fromNow() + ')';
            
            var isEditor = false;
            if( website.meta !== null )
                if( parseInt(website.meta.user_level) >= BCuserLevels.Editor )
                    isEditor = true;
    
            item._levelCaption = sprintf(
                BClanguage.userLevelCaption, item.author_level, manifest.userLevels[item.author_level]
            );
            
            rawDate = BCtoolbox.convertRemoteDate(item.author_creation_date, manifest.timezoneOffset);
            item._memberSinceCaption = sprintf(
                BClanguage.userMemberSince,
                moment(rawDate).format(BClanguage.dateFormats.shorter),
                moment(rawDate).fromNow()
            );
            
            var markup   = $('body').find(sprintf('template[data-type="%s"]', type)).html();
            var template = Template7.compile(markup);
            var context  = { item: item, service: service, website: website, manifest: manifest, isEditor: isEditor };
            var html     = template(context);
            var $card    = $(html);
            
            $card.data('context', context);
            $card.find('.card-header, .card-content').bind('click', function()
            {
                var $this = $(this);
                var $card = $this.closest('.card');
                var context = $card.data('context');
                
                console.log(context);
            });
            
            $collection.append($card);
            
            console.log('Item: ', item);
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
    }
};
