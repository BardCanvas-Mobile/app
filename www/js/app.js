
console.log('');
console.log('>>>>> -------------------------- <<<<<');
console.log('>>>>> Starting BardCanvas Mobile <<<<<');
console.log('>>>>> -------------------------- <<<<<');
console.log('');

// Global helpers
var f7 = new Framework7({
    material:                navigator.userAgent.search(/android/i) >= 0
    // , hideNavbarOnPageScroll:  true
    // , hideToolbarOnPageScroll: true
    // , hideTabbarOnPageScroll:  true
    // , showBarsOnPageScrollEnd: true
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
     * @var {View}
     */
    currentNestedView: null,
    
    /**
     * @private
     */
    __compiledTemplates: {},
    
    /**
     * @private
     */
    __commonServiceErrorTemplateMarkup : '',
    
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
        
        BCapp.__preloadSegments();
        
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
    
    __preloadSegments: function()
    {
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
        
        $.get('pages/misc_segments/navbar_selector_component.html', function(html)
        {
            html = '<script type="text/template" id="navbar_selector_component">'
                 + html
                 + '</script>';
            
            $('body').append(html);
        });
        
        $.get('pages/misc_segments/feed_templates.html', function(html)
        {
            $('body').append(html);
        });
        
        $.get('pages/website_addition/index.html', function(html)
        {
            BCapp.__compiledTemplates['pages/website_addition/index.html']
                = Template7.compile(html);
        });
        
        $.get('pages/website_addition/disclaimer.html', function(html)
        {
            BCapp.__compiledTemplates['pages/website_addition/disclaimer.html']
                = Template7.compile(html);
        });
        
        $.get('pages/site_templates/single_service_site.html', function(html)
        {
            BCapp.__compiledTemplates['pages/site_templates/single_service_site.html']
                = Template7.compile(html);
        });
        
        $.get('pages/site_templates/site_with_service_tabs.html', function(html)
        {
            BCapp.__compiledTemplates['pages/site_templates/site_with_service_tabs.html']
                = Template7.compile(html);
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
                $view.find('.toolbar:not(.always-visible)').show('slide', {direction: 'down'}, 100);
            }
            else
            {
                $view.toggleClass('toolbar-fixed', false, 100);
                $view.find('.toolbar:not(.always-visible)').hide('slide', {direction: 'down'}, 100);
            }
        });
    },
    
    __setLanguage: function()
    {
        var browserLanguage = navigator.language;
        if( browserLanguage.length > 2 ) browserLanguage = browserLanguage.substring(0, 2);
        
        if( browserLanguage === 'es' ) BCapp.settings.language = 'es_LA';
        else                           BCapp.settings.language = 'en_US';
        
        moment.locale(browserLanguage);
        
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
                    if( services.length > 1 )
                        BCapp.setNestedView(window.tmpWebsiteViewandler, serviceHandler);
                    else
                        BCapp.setNestedView(null);
                }, 100);
            });
        });
    },
    
    getCompiledTemplate: function( identifier )
    {
        if( typeof BCapp.__compiledTemplates[identifier] === 'undefined' )
        {
            var html = $(identifier).html();
            BCapp.__compiledTemplates[identifier] = Template7.compile( html );
        }
        
        return BCapp.__compiledTemplates[identifier];
    },
    
    getServiceError: function(title, message, website, service, contextAdditions)
    {
        if( BCapp.__commonServiceErrorTemplateMarkup === '' )
            BCapp.__commonServiceErrorTemplateMarkup = $('#common_service_error_template').html();
        
        html = BCapp.__commonServiceErrorTemplateMarkup
               .replace('{{title}}',   title)
               .replace('{{content}}', message);
        
        var manifest = BCmanifestsRepository.getForWebsite(website.URL);
        var context  = { website:  website, service: service, manifest: manifest };
        
        if( contextAdditions )
            for(var i in contextAdditions)
                context[i] = contextAdditions[i];
        
        var template = Template7.compile(html);
        
        return template(context);
    },
    
    renderSiteSelector: function(callback)
    {
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
        var template  = BCapp.getCompiledTemplate('#sidebar_sites_selector');
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
        $.getJSON(languageFileName, function(pageLanguage)
        {
            params.context  = pageLanguage;
            params.template = BCapp.getCompiledTemplate(templateFileName);
            view.router.load(params);
            
            if( typeof callback === 'function' ) callback();
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
        
        var templateIdentifier;
        if( manifest.services.length == 1 )
            templateIdentifier = 'pages/site_templates/single_service_site.html';
        else
            templateIdentifier = 'pages/site_templates/site_with_service_tabs.html';
        
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
            
            service.options.hasNavbar
                = typeof service.options.hasNavbar  === 'undefined' ? false : service.options.hasNavbar;
            
            service.options.hasToolbar
                = typeof service.options.hasToolbar === 'undefined' ? false : service.options.hasToolbar;
            
            var serviceClass = '';
            if(       service.type === 'iframe'           ) serviceClass = 'iframed-service';
            else if(  service.type === 'html'             ) serviceClass = 'prebuilt-service';
            else if ( service.type.indexOf('cards:') >= 0 ) serviceClass = 'feed-service';
            
            service.meta = {
                icon:         BChtmlHelper.convertIcon(service.icon),
                tabLink:      sprintf('#%s-%s', websiteMainViewClassName, service.id),
                tabTarget:    sprintf('%s-%s', websiteMainViewClassName, service.id),
                activeTab:    (parseInt(i) === 0 ? 'active' : ''),
                pageHandler:  sprintf('%s-%s-index', websiteMainViewClassName, service.id),
                markup:       BCapp.__getServiceMarkup(website, service),
                serviceClass: serviceClass,
                navbarClass:  service.options.hasNavbar  ? 'service-navbar-fixed'  : '',
                toolbarClass: service.options.hasToolbar ? 'service-toolbar-fixed' : ''
            };
            
            renderingServices[renderingServices.length] = service;
        }
        
        var context = {
            websiteMainViewClassName: websiteMainViewClassName,
            manifest:                 manifest,
            username:                 website.userName,
            services:                 renderingServices,
            navbarTitle:              website.userDisplayName !== '' ? website.userDisplayName : manifest.shortName,
                                      // sprintf('%s - %s', manifest.shortName, website.userDisplayName),
            serviceTabWidth:          (100 / renderingServices.length).toFixed(4) + '%'
        };
        
        // console.log(context);
        var template  = BCapp.getCompiledTemplate(templateIdentifier);
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
            console.log(sprintf('Service %s / %s view initialized.', websiteMainViewClassName, serviceViewName));
            
            if( renderingServices.length > 1 )
            {
                var view  = BCapp.framework.addView('.' + serviceViewName, params);
                
                if( typeof BCapp.nestedViewsCollection[websiteMainViewClassName] === 'undefined' )
                    BCapp.nestedViewsCollection[websiteMainViewClassName] = {};
                
                BCapp.nestedViewsCollection[websiteMainViewClassName][serviceViewName] = view;
            }
        }
        // console.log('Nested views collection: ', BCapp.nestedViewsCollection);
        
        BCapp.__addWebsiteMenu(website.handler, renderingServices, websiteMainViewClassName);
        
        if( typeof window.tmpAddWebsiteViewCallback === 'function' )
            window.tmpAddWebsiteViewCallback();
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
        var context  = { services: manifestServices, websiteHandler: websiteHandler };
        var template = BCapp.getCompiledTemplate('#sidebar_menu_template');
        
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
    
    /**
     * @param {BCwebsiteClass} website
     * @param {BCwebsiteServiceDetailsClass} service
     * 
     * @returns {string}
     * 
     * @private
     */
    __getServiceMarkup: function(website, service)
    {
        if( service.type === 'iframe'              ) return BCapp.__getIframedServiceMarkup(website, service);
        if( service.type === 'html'                ) return BCapp.__getHTMLserviceMarkup(website, service);
        if( service.type === 'feed/cards:simple'   ) return BCapp.__getCardedServiceMarkup(website, service);
        if( service.type === 'feed/cards:modern'   ) return BCapp.__getCardedServiceMarkup(website, service);
        if( service.type === 'feed/cards:facebook' ) return BCapp.__getCardedServiceMarkup(website, service);
        if( service.type === 'feed/media_list'     ) return BCapp.__getCardedServiceMarkup(website, service);
        
        return BCapp.getServiceError(
            BClanguage.unknownService.title,
            BClanguage.unknownService.message,
            website,
            service
        );
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
        var url      = BCapp.forgeServiceURL(service, website);
        var manifest = BCmanifestsRepository.getForWebsite(website.URL);
        var context  = { website: website, service: service, manifest: manifest, url: url };
        var template = BCapp.getCompiledTemplate('#iframed_service_template');
        
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
        var url    = BCapp.forgeServiceURL(service, website);
        var params = {
            bcm_platform:     BCapp.os,
            bcm_access_token: website.accessToken,
            wasuuup:          BCtoolbox.wasuuup()
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
     * @param {BCwebsiteClass} website
     * @param {BCwebsiteServiceDetailsClass} service
     * 
     * @returns {string}
     * 
     * @private
     */
    __getCardedServiceMarkup: function(website, service)
    {
        var url    = BCapp.forgeServiceURL(service, website);
        var params = {
            bcm_platform:     BCapp.os,
            bcm_access_token: website.accessToken,
            offset:           0,
            tzoffset:         0 - (new Date().getTimezoneOffset() / 60),
            wasuuup:          BCtoolbox.wasuuup()
        };
        
        var containerId = 'ajax_' + BCtoolbox.wasuuup();
        if( typeof window.tmpServiceFeeds === 'undefined' )
            window.tmpServiceFeeds = {};
        
        window.tmpServiceFeeds[containerId] = {
            url:     url,
            params:  params,
            website: website,
            service: service
        };
        
        // console.log(service);
        return sprintf('<div id="%s" class="bc-service-feed" data-feed-type="%s"></div>', containerId, service.type);
    },
    
    /**
     * @param {BCwebsiteServiceDetailsClass} service
     * @param {BCwebsiteClass}               website
     * @param {string}                       url to convert if not service.url
     * 
     * @returns {string}
     */
    forgeServiceURL: function(service, website, url)
    {
        if( typeof url === 'undefined' ) url = service.url;
        else                             url = url.replace(/^\//, '');
        
        if( url.length === 0 ) return '';
        
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
        
        $target.find('.bc-service-feed').each(function()
        {
            var $container = $(this);
            if( $container.attr('data-initialized') ) return;
            
            BCapp.__loadServiceFeed($container, true);
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
            
            var manifest = BCmanifestsRepository.getForWebsite(website.URL);
            var context  = { website: website, service: service, manifest: manifest, url: url };
            var template = Template7.compile(html);
            $container.html( template(context) );
            $container.attr('data-initialized', 'true');
            
            var pageId = '#' + $container.closest('.service-page').attr('id');
            BCapp.framework.initImagesLazyLoad( pageId );
            console.log( 'Lazy load triggered on ' + pageId );
            
            var $forms = $container.find('form');
            if( $forms.length === 0 ) return;
            
            $forms.each(function()
            {
                var $form = $(this);
                console.log('Binding ajax form ', $form.attr('id'));
                
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
            
            $container.find('.expandible_textarea').expandingTextArea();
        })
        .fail(function($xhr, status, error)
        {
            // BCapp.framework.hideIndicator();
            // BCtoolbox.hideNetworkActivityIndicator();
            
            $container.html(BCapp.getServiceError(
                BClanguage.failedToLoadService.title,
                BClanguage.failedToLoadService.message,
                website,
                service,
                {url: url, error: error}
            ));
            
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
        });
    },
    
    reloadAjaxifiedService: function(trigger)
    {
        var $container = $(trigger).closest('.service-page').find('.bc-ajaxified-service');
        BCapp.__loadAjaxifiedService($container, true);
    },
    
    __loadServiceFeed: function($container, showIndicator)
    {
        var $parentPage  = $container.closest('.page');
        var parentPageId = $parentPage.attr('id');
        console.log($parentPage);
        
        BCapp.__initServiceBar($('#' + parentPageId + '-navbar'),  'navbar',  $container);
        BCapp.__initServiceBar($('#' + parentPageId + '-toolbar'), 'toolbar', $container);
        
        if( typeof showIndicator === 'undefined' ) showIndicator = false;
        console.log('Show Loading indicator: ', showIndicator);
        
        var containerId = $container.attr('id');
        var data        = window.tmpServiceFeeds[containerId];
        var url         = data.url;
        var params      = data.params;
        var website     = data.website;
        var service     = data.service;
        
        console.log(sprintf('Fetching %s...', url));
        if( showIndicator ) BCtoolbox.showFullPageLoader();
        
        $.getJSON(url, params, function(data)
        {
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
            
            if( data.message !== 'OK' )
            {
                $container.html(BCapp.getServiceError(
                    BClanguage.errorReceived.title,
                    BClanguage.errorReceived.message,
                    website,
                    service,
                    {url: url, error: data.message}
                ));
                
                return;
            }
            
            BChtmlHelper.renderFeed($container, website, service, data);
            $container.attr('data-initialized', true);
        })
        .fail(function($xhr, status, error)
        {
            // BCapp.framework.hideIndicator();
            // BCtoolbox.hideNetworkActivityIndicator();
            
            $container.html(BCapp.getServiceError(
                BClanguage.failedToLoadService.title,
                BClanguage.failedToLoadService.message,
                website,
                service,
                {url: url, error: error}
            ));
            
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
        });
    },
    
    reloadServiceFeed: function(trigger)
    {
        var $container = $(trigger).closest('.service-page').find('.bc-service-feed');
        BCapp.__loadServiceFeed($container, true);
    },
    
    /**
     * 
     * @param {jQuery} $bar       The navbar/toolbar itself
     * @param {string} type       navbar|toolbar
     * @param {jQuery} $container Container view
     * @private
     */
    __initServiceBar: function($bar, type, $container)
    {
        if( $bar.length === 0 ) return;
        if( $bar.attr('initialized') === 'true' ) return;
        
        console.log(sprintf('Initializing %s #%s', type, $bar.attr('id')));
        
        var containerId = $container.attr('id');
        var data        = window.tmpServiceFeeds[containerId];
        var params      = data.params;
        var website     = data.website;
        var service     = data.service;
        var options     = service.options;
        var helpers     = type === 'navbar' ? options.navbarHelpers : options.toolbarHelpers;
        
        var alignments = [];
        if( helpers.length === 1 ) alignments = ['center'];
        if( helpers.length === 2 ) alignments = ['left', 'right'];
        if( helpers.length === 3 ) alignments = ['left', 'center', 'right'];
        
        for(var i in helpers)
        {
            var helper    = helpers[i];
            var alignment = alignments[i];
            
            if( helper.type === 'selector' )
            {
                BChtmlHelper.createNavbarSelector($bar, alignment, helper, containerId);
            }
            
            if( helper.type === 'searchbox' )
            {
                BChtmlHelper.createNavbarSearchHelper($bar, alignment, helper, containerId);
            }
        }
        
        $bar.attr('initialized', 'true');
    },
    
    setNestedView: function(mainViewSelector, websiteServiceSelector)
    {
        if( mainViewSelector === null )
        {
            BCapp.currentNestedView = null;
            
            return;
        }
        
        if( typeof BCapp.nestedViewsCollection[mainViewSelector] === 'undefined' ) return;
        if( typeof BCapp.nestedViewsCollection[mainViewSelector][websiteServiceSelector] === 'undefined' ) return;
        
        console.log('Nested views collection: ', BCapp.nestedViewsCollection);
        console.log(sprintf('Setting nested view for %s / %s', mainViewSelector, websiteServiceSelector));
        BCapp.currentNestedView = BCapp.nestedViewsCollection[mainViewSelector][websiteServiceSelector];
        console.log(sprintf('Current nested view set to %s', BCapp.currentNestedView.selector));
    },
    
    openURLinPopup: function(URL, name, specs, replace)
    {
        var $popup = $('#window_open_override_template');
        $popup.find('.navbar .title').text(URL);
        BCtoolbox.showFullPageLoader();
        $popup.find('iframe').attr('src', URL);
        
        BCapp.framework.popup($popup);
    },
    
    triggerAction: function( trigger )
    {
        var $trigger = $(trigger);
        var tdata    = JSON.parse(decodeURI($trigger.find('.bc-action-data').html()));
        
        if( tdata ) tdata = new BCactionTriggerClass(tdata);
    
        var $dataContainer = $trigger.closest('.item-data-container');
        var website        = $dataContainer.data('website');
        var service        = $dataContainer.data('service');
        var manifest       = $dataContainer.data('manifest');
        
        if( typeof manifest.actionsRegistry[tdata.action_id] === 'undefined' )
        {
            BCapp.framework.alert(
                BClanguage.actionsController.unregisteredAction.message,
                BClanguage.actionsController.unregisteredAction.title
            );
            
            return;
        }
        
        /**
         * @type {BCactionClass}
         */
        var action = manifest.actionsRegistry[tdata.action_id];
        
        console.log( tdata );
        console.log( action );
    }
};

var windowOpenBackup = window.open;
window.open = function (URL, name, specs, replace) { BCapp.openURLinPopup(URL, name, specs, replace); };

document.addEventListener('deviceready', BCapp.init, false);
