
console.log('');
console.log('>>>>> -------------------------- <<<<<');
console.log('>>>>> Starting BardCanvas Mobile <<<<<');
console.log('>>>>> -------------------------- <<<<<');
console.log('');

// Global helpers
var f7 = new Framework7({
    material:                navigator.userAgent.search(/android/i) >= 0,
    hideNavbarOnPageScroll:  true,
    hideToolbarOnPageScroll: true,
    hideTabbarOnPageScroll:  true,
    showBarsOnPageScrollEnd: true
});

// noinspection JSUnusedGlobalSymbols
var $$ = Dom7;

// BlockUI defaults
$.blockUI.defaults.css.border = '';
$.blockUI.defaults.css.backgroundColor = 'transparent';
$.blockUI.defaults.message = '<span class="preloader preloader-white bc-preloader-biggest"></span>';

Template7.global = {
    appVersion: '0.0.1',
    isIOS:      f7.device.os === 'ios',
    isAndroid:  f7.device.os !== 'ios',
    os:         f7.device.os,
    language:   null
};

var BCapp = {
    
    keyname: 'BCMOBILE',
    name:    'BardCanvas Mobile',
    version: Template7.global.appVersion,
    
    userAgent: 'BardCanvas Mobile/' + Template7.global.appVersion
               + ' '
               + navigator.appCodeName + '/' + navigator.appVersion,
    
    framework: f7,
    
    networkType:      null,
    networkConnected: false,
    
    batteryIsLow: false,
    
    screenWidth: 0,
    
    imgCacheEnabled: true,
    
    /**
     * @var {BCglobalSettingsClass}
     */
    settings: null,
    
    /**
     * @var {string} ios, android
     */
    os: null,
    
    /**
     * @var {View}
     */
    mainView: null,
    
    /**
     * @var {View}
     */
    addSiteView: null,
    
    /**
     * @var {View}
     */
    currentView: null,
    
    /**
     * @var {View[]} Key: website view selector
     */
    viewsCollection: [],
    
    /**
     * @var {string[]} Key: website view selector
     */
    websiteMenusCollection: [],
    
    /**
     * Current view collection of nested views
     * 
     * @var {View[][]} Key 1: website handler, Key 2: service id
     */
    nestedViewsCollection: [],
    
    /**
     * TODO: Forge this!
     * 
     * @var {View}
     */
    currentNestedView: null,
    
    init: function()
    {
        BCapp.settings = new BCglobalSettingsClass();
        BCapp.os = BCapp.framework.device.os;
        
        ImgCache.options.chromeQuota           = 50 * 1024 * 1024;
        ImgCache.options.cordovaFilesystemRoot = cordova.file.cacheDirectory;
        ImgCache.init(
            function () { BCapp.imgCacheEnabled = true; },
            function () { BCapp.imgCacheEnabled = false; }
        );
        
        $.get('pages/misc_segments/right_sidebar.html', function(html)
        {
            html = '<script type="text/template" id="sidebar_menu_template">'
                 + html
                 + '</script>';
            
            $('body').append(html);
        });
        
        $.get('pages/misc_segments/sites_selector.html', function(html)
        {
            html = '<script type="text/template" id="sidebar_sites_selector">'
                 + html
                 + '</script>';
            
            $('body').append(html);
        });
        
        BCapp.__adjustOrientation();
        $(window).resize(function() { BCapp.__adjustOrientation(); });
        
        var $progress = $('.bc-loader-container .bc-progress-bar');
        $progress.circleProgress();
        
        BCapp.__setLanguage();
        $progress.circleProgress('value', 0.2);
        
        BCapp.__loadRequirements();
        $progress.circleProgress('value', 0.4);
        
        BCeventHandlers.init();
        $progress.circleProgress('value', 0.6);
        
        BCwebsitesRepository.loadWebsitesRegistry(function()
        {
            $progress.circleProgress('value', 0.8);
            BCapp.__initViews(function() { $progress.circleProgress('value', 1); });
        });
    },
    
    __adjustOrientation: function()
    {
        var screenWidth  = $(window).width();
        var screenHeight = $(window).height();
        
        if( screenWidth === BCapp.screenWidth ) return;
        
        BCapp.screenWidth = screenWidth;
        
        var orientation = screenWidth <= screenHeight ? 'portrait' : 'landscape';
        var widthClass  = 300;
        if( screenWidth >=  400 ) widthClass =  400;
        if( screenWidth >=  500 ) widthClass =  500;
        if( screenWidth >=  600 ) widthClass =  600;
        if( screenWidth >=  700 ) widthClass =  700;
        if( screenWidth >=  800 ) widthClass =  800;
        if( screenWidth >=  900 ) widthClass =  900;
        if( screenWidth >= 1000 ) widthClass = 1000;
        
        $('body')
            .attr('data-orientation', orientation)
            .attr('data-width-class', widthClass);
        
        BCapp.__toggleToolbars();
    },
    
    __toggleToolbars: function()
    {
        // for(var i in BCapp.viewsCollection )
        // {
        //     var view = BCapp.viewsCollection[i];
        //     var sel  = view.selector;
        //    
        //     if( $(sel).attr('data-has-toolbar') )
        //     {
        //         if( $('body').attr('data-orientation') === 'portrait' )
        //         {
        //             $(sel).toggleClass('toolbar-fixed', true);
        //             view.showToolbar();
        //         }
        //         else
        //         {
        //             $(sel).toggleClass('toolbar-fixed', false);
        //             view.hideToolbar();
        //         }
        //     }
        // }
        
        $('.view[data-has-toolbar="true"], .page[data-has-toolbar="true"]').each(function()
        {
            var $view = $(this);
            
            if( $('body').attr('data-orientation') === 'portrait' )
            {
                $view.toggleClass('toolbar-fixed', true, 100);
                $view.find('.toolbar').show('slide', {direction: 'down'}, 100);
            }
            else
            {
                $view.toggleClass('toolbar-fixed', false, 100);
                $view.find('.toolbar').hide('slide', {direction: 'down'}, 100);
            }
        });
        
        
        // TODO: This snippet doesn't show properly on android.
        /*
        $('.bc-services-toolbar').each(function()
        {
            var widthClass = parseInt($('body').attr('data-width-class')) + 100; // Yeah, one icon above.
            var $toolbar   = $(this);
            var website    = $toolbar.attr('data-website');
            var $items     = $toolbar.find('.tab-link');
            var maxItems   = 0;
            
            console.log(sprintf('### Screen width class is %s', widthClass));
            if( $items.length * 100 <= widthClass )
            {
                console.log(sprintf('### Showing all items on %s toolbar.', website));
                $items.show();
    
                maxItems = $items.length;
            }
            else
            {
                maxItems = widthClass / 100;
                console.log(sprintf('### Hiding items above %s in %s toolbar.', maxItems, website));
                $items.each(function(index, element)
                {
                    $this = $(this);
                    if( index < maxItems ) $this.show();
                    else $this.hide();
                });
            }
            
            if( BCapp.os === 'android' )
            {
                var highlighterWidth = (100 / maxItems).toFixed(4) + '%';
                $toolbar.find('.tab-link-highlight').css('width', highlighterWidth);
            }
        });
        */
    },
    
    __setLanguage: function()
    {
        var browserLanguage = navigator.language;
        if( browserLanguage.length > 2 ) browserLanguage = browserLanguage.substring(0, 2);
        
        if( browserLanguage === 'es' ) BCapp.settings.language = 'es_LA';
        else                           BCapp.settings.language = 'en_US';
        
        $('head').append(sprintf(
            '<script type="text/javascript" src="js/language/%s.js"></script>', BCapp.settings.language
        ));
        
        Template7.global.language = BClanguage;
        
        for(var i in BClanguage.frameworkCaptions)
            BCapp.framework.params[i] = BClanguage.frameworkCaptions[i];
        
        $('head title').text(BClanguage.appName.replace('{{platform}}', BCapp.os));
    },
    
    __loadRequirements: function()
    {
        if( BCapp.os === 'ios' ) {
            $('head').append(
                '<link rel="stylesheet" href="lib/framework7-icons/css/framework7-icons.css">');
        }
        else {
            $('#f7_ui_styles').attr('href', 'lib/framework7/css/framework7.material.min.css');
            $('#f7_ui_colors').attr('href',
                'lib/framework7/css/framework7.material.colors.min.css');
        }
    },
    
    __initViews: function(postRenderingAction)
    {
        window.tmpInitViewsPostRenderingAction = postRenderingAction;
        
        var params = { };
        switch( BCapp.os ) {
            case 'ios':
                params.swipeBackPage = true;
                break;
            case 'android':
                params.material       = true;
                params.materialRipple = true;
                break;
        }
        
        BCapp.addSiteView = BCapp.framework.addView('.view-add-site', params);
        
        params.main    = true;
        BCapp.mainView = BCapp.framework.addView('.view-main', params);
        
        BCapp.currentView = BCapp.mainView;
        
        if( BCwebsitesRepository.collection.length == 0 )
        {
            console.log('No websites registered. Showing addition form.');
            
            BCapp.renderPage(
                'pages/website_addition/index.html',
                BCapp.addSiteView,
                { reload: true },
                function() {
                    var $form = $('#add_website_form');
                    $form[0].reset();
                    $form.ajaxForm({
                        target:       '#ajax_form_target',
                        beforeSubmit: BCwebsitesRepository.websiteAdditionSubmission
                    });
                    window.tmpInitViewsPostRenderingAction();
                    BCapp.showView('.view-add-site');
                }
            );
            
            return;
        }
        
        console.log(sprintf('%s websites registered. Prepping addition form.', BCwebsitesRepository.collection.length));
        BCapp.renderPage(
            'pages/website_addition/index.html',
            BCapp.addSiteView,
            { reload: true },
            function() {
                var $form = $('#add_website_form');
                $form[0].reset();
                $form.ajaxForm({
                    target:       '#ajax_form_target',
                    beforeSubmit: BCwebsitesRepository.websiteAdditionSubmission
                });
            }
        );
        
        // TODO: Evaluate what to show on startup
        window.tmpWebsiteToShowInterval = null;
        window.tmpWebsite               = BCwebsitesRepository.collection[0];
        window.tmpWebsiteViewandler     = BCwebsitesRepository.convertHandlerToViewClassName(window.tmpWebsite.handler);
        window.tmpWebsiteToShowSelector = '.' + window.tmpWebsiteViewandler;
        
        console.log('Website to show: ', window.tmpWebsite.URL);
        console.log('View selector to show: ', window.tmpWebsiteToShowSelector);
        
        console.log('Rendering site selector and adding website views.');
        BCapp.renderSiteSelector(function()
        {
            BCapp.__renderAllWebsiteViews(function()
            {
                window.tmpInitViewsPostRenderingAction();
                
                window.tmpWebsiteToShowInterval = setInterval(function()
                {
                    if( $(window.tmpWebsiteToShowSelector).length === 0 ) return;
                    
                    clearInterval(window.tmpWebsiteToShowInterval);
                    
                    console.log(sprintf(
                        'Rendering first website (here the wall should be rendered). Selector: %s',
                        window.tmpWebsiteToShowSelector
                    ));
                    BCapp.showView(window.tmpWebsiteToShowSelector);
                    
                    var services        = BCmanifestsRepository.getServicesForWebsite(window.tmpWebsite.URL);
                    var serviceHandler  = window.tmpWebsiteViewandler + '-' + services[0].id;
                    var serviceSelector = serviceHandler + '-index';
                    console.log(sprintf('Triggering service %s', serviceSelector));
                    BCapp.triggerServiceLoad(serviceSelector);
                    BCapp.setNestedView(window.tmpWebsiteViewandler, serviceHandler);
                }, 100);
            });
        });
    },
    
    renderSiteSelector: function(callback)
    {
        var sourceHTML = $('#sidebar_sites_selector').html();
        
        var context = { registeredSites: [] };
        for( var i in BCwebsitesRepository.collection )
        {
            var website   = BCwebsitesRepository.collection[i];
            var handler   = website.handler;
            var websiteCN = BCwebsitesRepository.convertHandlerToViewClassName(handler);
            
            if( typeof BCmanifestsRepository.collection[website.manifestFileHandler] !== 'undefined' )
            {
                var manifest = BCmanifestsRepository.collection[website.manifestFileHandler];
                context.registeredSites[context.registeredSites.length] = {
                    targetView:      '.' + websiteCN,
                    siteLink:        '#' + websiteCN,
                    siteIcon:        manifest.icon,
                    siteShortName:   manifest.shortName,
                    userDisplayName: website.userDisplayName
                };
                
                console.log(sprintf('%s added to the selector menu', manifest.shortName));
            }
        }
        
        // console.log(context);
        var template = Template7.compile(sourceHTML);
        var finalHTML = template(context);
        
        $('#left-panel').html(finalHTML);
        
        if( typeof callback === 'function' ) callback();
    },
    
    __renderAllWebsiteViews: function(callback) 
    {
        for( var i in BCwebsitesRepository.collection )
        {
            var website   = BCwebsitesRepository.collection[i];
            var handler   = website.handler;
            var websiteCN = BCwebsitesRepository.convertHandlerToViewClassName(handler);
            
            if( typeof BCmanifestsRepository.collection[website.manifestFileHandler] !== 'undefined' )
            {
                var manifest = BCmanifestsRepository.collection[website.manifestFileHandler];
                
                BCapp.addWebsiteView(website, manifest, websiteCN);
            }
        }
        
        if( typeof callback === 'function' ) callback();
    },
    
    renderPage: function(templateFileName, view, params, callback)
    {
        var languageFileName = sprintf('%s.%s.json', templateFileName, BClanguage.iso);
        $.getJSON(languageFileName, function(pageLanguage) {
            params.context = pageLanguage;
            $.get(templateFileName, function(sourceHTML) {
                params.template = Template7.compile(sourceHTML);
                view.router.load(params);
                
                if( typeof callback === 'function' ) callback();
            });
        });
    },
    
    /**
     * @param {BCwebsiteClass}         website
     * @param {BCwebsiteManifestClass} manifest
     * @param {string}                 websiteMainViewClassName
     * @param {function}               callback
     */
    addWebsiteView: function(website, manifest, websiteMainViewClassName, callback)
    {
        window.tmpAddWebsiteViewCallback = callback;
        
        // TODO: Check different use cases for templates
        var file = 'pages/site_templates/site_with_service_tabs.html';
        $.get(file, function(sourceHTML)
        {
            var renderingServices = [];
            
            // Prep icons
            for(var i in manifest.services)
            {
                var service  = new BCwebsiteServiceDetailsClass(manifest.services[i]);
                
                if( service.requires )
                {
                    if( typeof website.meta[service.requires] === 'undefined' )
                    {
                        continue;
                    }
                }
                
                service.meta = {
                    icon:        BCapp.__convertIcon(service.icon),
                    tabLink:     sprintf('#%s-%s', websiteMainViewClassName, service.id),
                    tabTarget:   sprintf('%s-%s', websiteMainViewClassName, service.id),
                    activeTab:   (parseInt(i) === 0 ? 'active' : ''),
                    pageHandler: sprintf('%s-%s-index', websiteMainViewClassName, service.id),
                    markup:      BCapp.__getServiceMarkup(website, service)
                };
                
                renderingServices[renderingServices.length] = service;
            }
            
            var context = {
                websiteMainViewClassName: websiteMainViewClassName,
                manifest:                 manifest,
                username:                 website.userName,
                services:                 renderingServices,
                navbarTitle:              website.userDisplayName, // sprintf('%s - %s', manifest.shortName, website.userDisplayName),
                serviceTabWidth:          (100 / renderingServices.length).toFixed(4) + '%'
            };
            
            // console.log(context);
            var template = Template7.compile(sourceHTML);
            var finalHTML = template(context);
            $('.views').append(finalHTML);
            
            var params = {};
            switch( BCapp.os ) {
                case 'ios':
                    params.swipeBackPage = true;
                    params.dynamicNavbar = false;
                    break;
                case 'android':
                    params.material       = true;
                    params.materialRipple = true;
                    break;
            }
            
            // params.name = websiteMainViewClassName;
            BCapp.viewsCollection[websiteMainViewClassName]
                = BCapp.framework.addView('.' + websiteMainViewClassName, params);
            console.log(sprintf('Website view %s rendered.', websiteMainViewClassName));
            
            for( i in renderingServices )
            {
                // params.name         = serviceViewName;
                var serviceViewName = renderingServices[i].meta.tabTarget;
                var view            = BCapp.framework.addView('.' + serviceViewName, params);
                console.log(sprintf('Service %s / %s view initialized.', websiteMainViewClassName, serviceViewName));
                
                if( typeof BCapp.nestedViewsCollection[websiteMainViewClassName] === 'undefined' )
                    BCapp.nestedViewsCollection[websiteMainViewClassName] = {};
                
                BCapp.nestedViewsCollection[websiteMainViewClassName][serviceViewName] = view;
            }
            // console.log('Nested views collection: ', BCapp.nestedViewsCollection);
            
            BCapp.__addWebsiteMenu(website.handler, renderingServices, websiteMainViewClassName);
            
            if( typeof window.tmpAddWebsiteViewCallback === 'function' )
                window.tmpAddWebsiteViewCallback();
        });
    },
    
    /**
     * Manifest should have services with metadata already forged!
     * 
     * @param {string}                       websiteHandler
     * @param {BCwebsiteServiceDetailsClass} manifestServices
     * @param {string}                       websiteMainViewClassName
     */
    __addWebsiteMenu: function(websiteHandler, manifestServices, websiteMainViewClassName)
    {
        var sourceHTML = $('#sidebar_menu_template').html();
        var context    = { services: manifestServices, websiteHandler: websiteHandler };
        var template   = Template7.compile(sourceHTML);
        
        BCapp.websiteMenusCollection[websiteMainViewClassName] = template(context);
        console.log(sprintf('Added menu for %s to the menus collection.', websiteMainViewClassName));
    },
    
    showView: function( selector, callback )
    {
        console.log('Actual view: ' + BCapp.currentView.selector);
        
        BCapp.__toggleToolbars();
        
        if( selector === BCapp.currentView.selector )
        {
            if( typeof callback === 'function' ) callback();
            
            return;
        }
        
        if( $(BCapp.currentView.selector).is(':visible') )
            $(BCapp.currentView.selector).fadeOut('fast');
        
        if( $(selector).not(':visible') )
            $(selector).fadeIn('fast');
        
        if( selector === '.view-main' )
        {
            BCapp.currentView = BCapp.mainView;
        }
        else if( selector === '.view-add-site' )
        {
            BCapp.addSiteView.router.back({animatePages: false});
            BCapp.currentView = BCapp.addSiteView;
        }
        else
        {
            for( var i in BCapp.viewsCollection )
            {
                if( BCapp.viewsCollection[i].selector === selector )
                {
                    BCapp.currentView = BCapp.viewsCollection[i];
                    
                    break;
                }
            }
        }
        
        console.log('Current view internal pointer set to ' + BCapp.currentView.selector);
        
        var menuKey = selector.replace(/^\./, '');
        if( BCapp.websiteMenusCollection[menuKey] )
            $('#right-panel').html(BCapp.websiteMenusCollection[menuKey]);
        console.log(sprintf('Injected sidebar menu for %s', menuKey));
        
        if( typeof callback === 'function' ) callback();
    },
    
    showWebsiteAdditionView: function()
    {
        window.tmpViewToReturnWhenCancellingWebsiteAddition = BCapp.currentView;
        $('#cancel_website_addition_button').show();
        BCapp.showView('.view-add-site'); 
    },
    
    cancelWebsiteAddition: function()
    {
        BCapp.showView(window.tmpViewToReturnWhenCancellingWebsiteAddition.selector);
    },
    
    __convertIcon: function(source)
    {
        // iOS,Android
        if( source.indexOf(',') >= 0 )
        {
            var parts = source.split(',');
            
            return sprintf('<i class="bc-ios-icon icon f7-icons">%s</i>', parts[0]) +
                   sprintf('<i class="bc-android-icon icon fa %s"></i>',       parts[1]);
        }
        
        if( source.indexOf('data:') === 0 )
        {
            return sprintf('<img class="icon" src="%s">', source);
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
            
            return sprintf('<img class="icon" src="%s">', source);
        }
        
        if( source.indexOf('fa') === 0 )
        {
            return sprintf('<i class="icon fa %s"></i>', source);
        }
        
        return source;
    },
    
    /**
     * TODO: Implement rendering of markup for other service types
     *
     * @param {BCwebsiteClass} website
     * @param {BCwebsiteServiceDetailsClass} service
     * 
     * @returns {string}
     * 
     * @private
     */
    __getServiceMarkup: function(website, service)
    {
        if( service.type === 'iframe' ) return BCapp.__getIframedServiceMarkup(website, service);
        if( service.type === 'html'   ) return BCapp.__getHTMLserviceMarkup(website, service);
        
        var manifest  = BCmanifestsRepository.getForWebsite(website.URL);
        var html      = $('#common_service_error_template').html()
                        .replace('{{title}}',   BClanguage.unknownService.title)
                        .replace('{{content}}', BClanguage.unknownService.message);
        var context = { website:  website, service: service, manifest: manifest };
        var template  = Template7.compile(html);
        
        return template(context);
    },
    
    /**
     * @param {BCwebsiteClass} website
     * @param {BCwebsiteServiceDetailsClass} service
     * 
     * @returns {string}
     * 
     * @private
     */
    __getIframedServiceMarkup: function(website, service)
    {
        var url       = BCapp.__forgeServiceURL(service, website);
        var manifest  = BCmanifestsRepository.getForWebsite(website.URL);
        var html      = $('#iframed_service_template').html();
        var context   = { website: website, service: service, manifest: manifest, url: url };
        var template  = Template7.compile(html);
        
        return template(context);
    },
    
    /**
     * @param {BCwebsiteClass} website
     * @param {BCwebsiteServiceDetailsClass} service
     * 
     * @returns {string}
     * 
     * @private
     */
    __getHTMLserviceMarkup: function(website, service)
    {
        var url    = BCapp.__forgeServiceURL(service, website);
        var params = {
            platform:     BCapp.os,
            access_token: website.accessToken,
            wasuuup:      BCtoolbox.wasuuup()
        };
        
        var containerId = 'ajax_' + BCtoolbox.wasuuup();
        if( typeof window.tmpAjaxifiedServices === 'undefined' )
            window.tmpAjaxifiedServices = {};
        
        window.tmpAjaxifiedServices[containerId] = {
            url:     url,
            params:  params,
            website: website,
            service: service
        };
        
        return sprintf('<div id="%s" class="bc-ajaxified-service"></div>', containerId);
    },
    
    /**
     * @param {BCwebsiteServiceDetailsClass} service
     * @param {BCwebsiteClass} website
     * 
     * @returns {string}
     * 
     * @private
     */
    __forgeServiceURL: function(service, website)
    {
        var url = service.url;
        if( url.indexOf(':') < 0 ) url = website.URL + url;
        
        url = url.replace('{{platform}}',     BCapp.os);
        url = url.replace('{{user_name}}',    website.userName);
        url = url.replace('{{password}}',     website.password);
        url = url.replace('{{access_token}}', website.accessToken);
        url = url.replace('{{random_seed}}',  BCtoolbox.wasuuup());
        
        if( website.meta )
        {
            for(var key in website.meta)
            {
                var search = sprintf('{{%s}}', key);
                var replace = website.meta[key];
                url = url.replace(search, replace);
            }
        }
        
        return url;
    },
    
    triggerServiceLoad: function(pageHandler)
    {
        var $target = $(sprintf('.page[data-page="%s"]', pageHandler));
        
        $target.find('iframe').each(function()
        {
            if( $(this).attr('data-initialized') ) return;
            
            var src = $(this).attr('data-src');
            $(this).attr('src', src).attr('data-initialized', 'true');
            
            console.log(sprintf('Iframe for %s initialized.', pageHandler));
            BCtoolbox.showFullPageLoader();
        });
        
        $target.find('.bc-ajaxified-service').each(function()
        {
            var $container = $(this);
            if( $container.attr('data-initialized') ) return;
            
            BCapp.__loadAjaxifiedService($container, true);
        });
    },
    
    __loadAjaxifiedService: function($container, showIndicator)
    {
        if( typeof showIndicator === 'undefined' ) showIndicator = false;
        console.log('Show Loading indicator: ', showIndicator);
        
        var containerId = $container.attr('id');
        var data        = window.tmpAjaxifiedServices[containerId];
        var url         = data.url;
        var params      = data.params;
        var website     = data.website;
        var service     = data.service;
        
        console.log(sprintf('Fetching %s...', url));
        if( showIndicator ) BCtoolbox.showFullPageLoader();
        
        $.get(url, params, function(html)
        {
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
            
            var manifest  = BCmanifestsRepository.getForWebsite(website.URL);
            var context   = { website: website, service: service, manifest: manifest, url: url };
            var template  = Template7.compile(html);
            $container.html( template(context) );
            $container.attr('data-initialized', 'true');
            
            var pageId = '#' + $container.closest('.service-page').attr('id');
            BCapp.framework.initImagesLazyLoad( pageId );
            console.log( 'Lazy load triggered on ' + pageId );
            
            var $forms = $container.find('form');
            if( $forms.length === 0 ) return;
            
            $forms.each(function()
            {
                var $form    = $(this);
                var targetId = $form.attr('id') + '_target';
                var options  = {
                    target:          '#' + targetId,
                    beforeSerialize: BCtoolbox.ajaxform_beforeSerialize,
                    beforeSubmit:    BCtoolbox.ajaxform_beforeSubmit,
                    beforeSend:      function(xhr, options)
                                     {
                                         BCtoolbox.ajaxform_beforeSend(xhr, options, $form);
                                     },
                    uploadProgress:  function(event, position, total, percentComplete)
                                     {
                                         BCtoolbox.ajaxform_uploadProgress(
                                             event, position, total, percentComplete, $form
                                         );
                                     },
                    success:         BCtoolbox.ajaxform_success,
                    error:           function(xhr, textStatus, errorThrown)
                                     {
                                         BCtoolbox.ajaxform_fail(xhr, textStatus, errorThrown, $form);
                                     }
                };
                
                if( $('#' + targetId).length === 0 )
                    $('body').append(sprintf('<div id="%s" style="display: none"></div>', targetId));
                
                $form.ajaxForm(options);
            });
        })
        .fail(function($xhr, status, error)
        {
            // BCapp.framework.hideIndicator();
            // BCtoolbox.hideNetworkActivityIndicator();
            
            var html     = $('#common_service_error_template').html()
                           .replace('{{title}}',   BClanguage.failedToLoadService.title)
                           .replace('{{content}}', BClanguage.failedToLoadService.message);
            var manifest = BCmanifestsRepository.getForWebsite(website.URL);
            var context  = { website: website, service: service, manifest: manifest, url: url, error: error };
            var template = Template7.compile(html);
            $container.html( template(context) );
            
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
        });
    },
    
    reloadAjaxifiedService: function(trigger)
    {
        var $container = $(trigger).closest('.service-page').find('.bc-ajaxified-service');
        BCapp.__loadAjaxifiedService($container, true);
    },
    
    setNestedView: function(mainViewSelector, websiteServiceSelector)
    {
        console.log('Nested views collection: ', BCapp.nestedViewsCollection);
        console.log(sprintf('Setting nested view for %s / %s', mainViewSelector, websiteServiceSelector));
        BCapp.currentNestedView = BCapp.nestedViewsCollection[mainViewSelector][websiteServiceSelector];
        console.log(sprintf('Current nested view set to %s', BCapp.currentNestedView.selector));
    }
};

document.addEventListener('deviceready', BCapp.init, false);
