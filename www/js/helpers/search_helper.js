
var BCsearchHelper = {
    
    __feedData:   null,
    __helperData: null,
    __page:       null,
    __form:       null,
    
    __helperURL:    '',
    __helperParams: {},
    
    __running: false,
    __xhr:     null,
    
    create: function($trigger, containerId, helperData, feedData)
    {
        console.log('Creating Search Helper instance for %s', containerId);
        BCsearchHelper.__feedData   = feedData;
        BCsearchHelper.__helperData = helperData;
        
        var i;
        var website  = feedData.website;
        var service  = feedData.service;
        var manifest = BCmanifestsRepository.getForWebsite(website.URL);
        
        BCsearchHelper.__helperURL = BCapp.forgeServiceURL(service, website, helperData.contentsProvider);
        console.log('Search Helper URL: %s', BCsearchHelper.__helperURL);
        
        var params = {};
        if( typeof feedData.params === 'object' )
            for(i in feedData.params)
                params[i] = feedData.params[i];
        if( service.vars )
            for(i in service.vars)
                params[i] = service.vars[i];
        
        params.since  = '';
        params.until  = '';
        params.search = '';
        
        BCsearchHelper.__helperParams = params;
        console.log('Built helper params:', params);
        
        var $feedContainer = $('#' + containerId);
        var $feedPage      = $feedContainer.closest('.service-page');
        var $pagesHub      = $feedPage.closest('.pages');
        
        var $feedNavbarContents   = $trigger.closest('.navbar-inner');
        var $feedNavbar           = $feedNavbarContents.closest('.navbar');
        
        var pageId   = 'search-' + BCtoolbox.wasuuup();
        var context  = {
            pageId:            pageId,
            website:           website,
            service:           service,
            manifest:          manifest,
            searchPlaceholder: BClanguage.actions.search
        };
        
        var template;
        template                  = BCapp.getCompiledTemplate('template[data-type="feed_search_page"]');
        var $searchPage           = $(template(context));
        template                  = BCapp.getCompiledTemplate('template[data-type="feed_search_navbar"]');
        var $searchNavbarContents = $(template(context));
        
        BCsearchHelper.__page = $searchPage;
        
        var $form = $searchNavbarContents.find('form');
        $form.data('source_navbar_contents', $feedNavbarContents);
        $form.data('search_navbar_contents', $searchNavbarContents);
        $form.data('source_page_contents',   $feedPage);
        $form.data('search_page_contents',   $searchPage);
        BCsearchHelper.__form = $form;
        
        $pagesHub.append($searchPage);
        $feedNavbar.append($searchNavbarContents);
        
        $feedNavbarContents.hide('slide', {direction: 'left'}, 100);
        $searchNavbarContents.show('slide', {direction: 'right'}, 100);
        
        $feedPage.hide('slide', {direction: 'left'}, 100);
        $searchPage.show('slide', {direction: 'right'}, 100);
    
        var $searchPageContent  = $searchPage.find('.service-content');
        var searchPageContentId = pageId + '-content';
        BCapp.framework.attachInfiniteScroll('#' + searchPageContentId);
        $searchPageContent.on('infinite', function()
        {
            if( BCsearchHelper.__running ) return;
            
            var $page   = BCsearchHelper.__page;
            var params  = BCsearchHelper.__helperParams;
            var url     = BCsearchHelper.__helperURL;
            var website = BCsearchHelper.__feedData.website;
            var service = BCsearchHelper.__feedData.service;
            
            BCsearchHelper.__fetch(url, params, website, service, $page);
        });
        $searchPageContent.attr('infinite-scroll-attached', 'true');
        console.log('> Infinite scroll attached to #' + searchPageContentId);
    },
    
    search: function()
    {
        var $page  = BCsearchHelper.__page;
        var $form  = BCsearchHelper.__form;
        var $input = $form.find('.searchbar-input').find('input[type="search"]');
        var value  = $input.val().trim();
        
        if( value === '' )
        {
            $form.find('.searchbar-clear').css('opacity', 0).css('pointer-events', 'none');
            $page.find('.search-results').hide('scale', {direction: 'vertical'}, 'fast', function() { $(this).find('ul').html('') });
            BCsearchHelper.stop();
            BCsearchHelper.__helperParams.search = '';
            BCsearchHelper.__helperParams.since  = '';
            BCsearchHelper.__helperParams.until  = '';
            
            return;
        }
        else
        {
            if( value === BCsearchHelper.__helperParams.search ) return;
            
            BCsearchHelper.__helperParams.since  = '';
            BCsearchHelper.__helperParams.until  = '';
        }
        
        $page.find('.empty-search-results').hide('scale', {direction: 'vertical'}, 'fast');
        
        if( BCsearchHelper.__running ) BCsearchHelper.stop();
        
        $form.find('.searchbar-clear').css('opacity', 1).css('pointer-events', 'all');
        BCsearchHelper.start();
    },
    
    start: function()
    {
        var $page = BCsearchHelper.__page;
        
        console.log('Search started.');
        $page.find('.searching-progress').fadeIn('fast');
        
        var $form   = BCsearchHelper.__form;
        var $input  = $form.find('.searchbar-input').find('input[type="search"]');
        var value   = $input.val().trim();
        var params  = BCsearchHelper.__helperParams;
        var url     = BCsearchHelper.__helperURL;
        var website = BCsearchHelper.__feedData.website;
        var service = BCsearchHelper.__feedData.service;
        
        params.search = value;
        params.since  = '';
        params.until  = '';
        BCsearchHelper.__fetch(url, params, website, service, $page);
    },
    
    __fetch: function(url, params, website, service, $page)
    {
        BCsearchHelper.__running = true;
        
        $page.find('.empty-search-results').hide('scale', {direction: 'vertical'}, 'fast');
        console.log('Opening %s using %s...', url, JSON.stringify(params));
        $.getJSON(url, params, function(data)
        {
            if( data.message !== 'OK' )
            {
                BCtoolbox.addNotification(BCapp.getServiceError(
                    BClanguage.errorReceived.title,
                    BClanguage.errorReceived.message,
                    website,
                    service,
                    {url: url, error: data.message}
                ));
                BCsearchHelper.stop();
                $page.find('.bc-feed-refresher').hide();
                
                return;
            }
            
            BCsearchHelper.__running = false;
            $page.find('.searching-progress').fadeOut('fast');
            
            if( data.data.length === 0 )
            {
                $page.find('.search-results').hide('scale', {direction: 'vertical'}, 'fast', function() { $(this).find('ul').html('') });
                $page.find('.empty-search-results').show('scale', {direction: 'vertical'}, 'fast');
                $page.find('.bc-feed-refresher').hide();
                
                return;
            }
            
            $page.find('.search-results').show();
            BCsearchHelper.render(data.data);
            $page.find('.bc-feed-refresher').show();
            
            BCsearchHelper.__helperParams.until =
                $page.find('.search-results .bc-feed-item:last').attr('data-publishing-date');
        })
        .fail(function($xhr, status, error)
        {
            BCtoolbox.addNotification(BCapp.getServiceError(
                BClanguage.errorReceived.title,
                BClanguage.errorReceived.message,
                website,
                service,
                {url: url, error: error}
            ));
            BCsearchHelper.stop();
            $page.find('.bc-feed-refresher').hide();
        });
    },
    
    stop: function()
    {
        var $page = BCsearchHelper.__page;
        if( BCsearchHelper.__xhr !== null ) BCsearchHelper.__xhr.abort();
        BCsearchHelper.__running = false;
        
        console.log('Search stopped.');
        $page.find('.searching-progress').fadeOut('fast');
        $page.find('.bc-feed-refresher').hide();
    },
    
    clear: function()
    {
        var $form  = BCsearchHelper.__form;
        var $input = $form.find('.searchbar-input').find('input[type="search"]');
        $input.val('');
        $page.find('.empty-search-results').hide('scale', {direction: 'vertical'}, 'fast');
        
        console.log('Search cleared.');
        BCsearchHelper.search();
    },
    
    close: function()
    {
        BCsearchHelper.stop();
        
        var $form                 = BCsearchHelper.__form;
        var $feedNavbarContents   = $form.data('source_navbar_contents');
        var $searchNavbarContents = $form.data('search_navbar_contents');
        var $feedPage             = $form.data('source_page_contents');
        var $searchPage           = $form.data('search_page_contents');
        
        $feedNavbarContents.show('slide', {direction: 'left'}, 200);
        $searchNavbarContents.hide('slide', {direction: 'right'}, 200, function() { $(this).remove(); });
        
        $feedPage.show('slide', {direction: 'left'}, 200);
        $searchPage.hide('slide', {direction: 'right'}, 200, function() { $(this).remove(); });
        
        console.log('Search helper removed.');
    },
    
    render: function(items)
    {
        var $page       = BCsearchHelper.__page;
        var website     = BCsearchHelper.__feedData.website;
        var service     = BCsearchHelper.__feedData.service;
        var manifest    = BCmanifestsRepository.getForWebsite(website.URL);
        var $collection = $page.find('.search-results ul');
        
        var lastItemPubDate = '';
        for(var i in items)
        {
            var item = BChtmlHelper.prepareItem(new BCfeedItemClass(items[i]), website, service, manifest);
            
            var itemAuthorUserName = item.author_user_name;
            var currentUserLevel   = 0;
            var currentUserName    = '';
            var currentUserIsAdmin = false;
            if( website.meta !== null )
            {
                currentUserLevel   = parseInt(website.meta.user_level);
                currentUserName    = website.userName;
                currentUserIsAdmin = currentUserLevel >= BCuserLevels.Editor;
            }
            
            item._showCategoryLabel = true;
            
            var context   = {
                currentUser: {level: currentUserLevel, userName: currentUserName, isAdmin: currentUserIsAdmin},
                item:        item,
                service:     service,
                website:     website,
                manifest:    manifest
            };
            
            var template = BCapp.getCompiledTemplate('template[data-type="feed_search_item"]');
            var html     = template(context);
            var $card    = $(html);
            
            $card.data('context',  context);
            $card.data('website',  website);
            $card.data('service',  service);
            $card.data('manifest', manifest);
            $card.find('.item-link').bind('click', function()
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
    }
};
