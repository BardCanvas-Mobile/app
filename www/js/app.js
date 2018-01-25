
console.log('');
console.log('>>>>> -------------------------- <<<<<');
console.log('>>>>> Starting BardCanvas Mobile <<<<<');
console.log('>>>>> -------------------------- <<<<<');
console.log('');

// Global helpers
var f7 = new Framework7({
    material: navigator.userAgent.search(/android/i) >= 0
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
$.blockUI.defaults.message        = '<span class="preloader preloader-white bc-preloader-biggest"></span>';
$.blockUI.defaults.messageSmaller = '<span class="preloader preloader-white bc-preloader-smaller"></span>';

Template7.global = {
    appVersion: '0.0.3',
    isIOS:      f7.device.os === 'ios',
    isAndroid:  f7.device.os !== 'ios',
    os:         f7.device.os,
    language:   null
};

var BCapp = {
    
    keyname: 'BCMOBILE',
    name:    'BardCanvas Mobile',
    version: Template7.global.appVersion,
    
    featuredSitesInfoURLprefix: 'https://bardcanvas.com/bcm_featured_sites',
    
    userAgent: 'BardCanvas Mobile/' + Template7.global.appVersion
               + ' '
               + navigator.appCodeName + '/' + navigator.appVersion,
    
    framework: f7,
    
    networkType:      null,
    networkConnected: false,
    
    batteryIsLow: false,
    
    screenWidth: 0,
    
    imgCacheEnabled: true,
    
    defaults: {
        feedsRetrievingInterval: 3600 * 1000
    },
    
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
        BCapp.os = BCapp.framework.device.os;
        
        ImgCache.options.chromeQuota           = 50 * 1024 * 1024;
        ImgCache.options.cordovaFilesystemRoot = cordova.file.cacheDirectory;
        ImgCache.init(
            function () { BCapp.imgCacheEnabled = true; },
            function () { BCapp.imgCacheEnabled = false; }
        );
        
        BCglobalSettings.init(function()
        {
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
                BCapp.__initViews(function()
                {
                    $progress.circleProgress('value', 1);
                });
            });
            
            setInterval(function() { BCapp.updateTimeAgoDates(); }, 30000);
        });
    },
    
    updateTimeAgoDates: function()
    {
        $('.timeago').each(function()
        {
            var $this     = $(this);
            var rawDate   = $this.attr('data-raw-date');
            var parts     = rawDate.split(' ');
            var date      = parts[0] + ' ' + parts[1];
            var timezone  = parts[2];
            var finalDate = BCtoolbox.convertRemoteDate(date, timezone);
            var output    = moment(finalDate).fromNow();
            
            // console.log(sprintf('Updating date from %s to %s on ', rawDate, output), $this);
            $this.text(output);
        });
    },
    
    __preloadSegments: function()
    {
        $.get('pages/misc_segments/right_sidebar.html', function(html)
        {
            html = '<script type="text/template" id="sidebar_menu_template">'
                 + html
                 + '</script>';
            
            $('#static_templates').append(html);
        });
        
        $.get('pages/misc_segments/sites_selector.html', function(html)
        {
            html = '<script type="text/template" id="sidebar_sites_selector">'
                 + html
                 + '</script>';
            
            $('#static_templates').append(html);
        });
        
        $.get('pages/misc_segments/navbar_selector_component.html', function(html)
        {
            html = '<script type="text/template" id="navbar_selector_component">'
                 + html
                 + '</script>';
            
            $('#static_templates').append(html);
        });
        
        $.get('pages/misc_segments/feed_templates.html', function(html)
        {
            $('#static_templates').append(html);
        });
        
        $.get('pages/misc_segments/single_feed_item.html', function(html)
        {
            $('#static_templates').append(html);
        });
        
        $.get('pages/misc_segments/feed_search_page.html', function(html)
        {
            var $html = $('<div>' + html + '</div>');
            
            BCapp.__compiledTemplates['template[data-type="feed_search_page"]']
                = Template7.compile( $html.find('template[data-type="feed_search_page"]').html() );
            
            BCapp.__compiledTemplates['template[data-type="feed_search_navbar"]']
                = Template7.compile( $html.find('template[data-type="feed_search_navbar"]').html() );
            
            BCapp.__compiledTemplates['template[data-type="feed_search_item"]']
                = Template7.compile( $html.find('template[data-type="feed_search_item"]').html() );
        });
        
        $.get('pages/website_addition/index.html', function(html)
        {
            BCapp.__compiledTemplates['pages/website_addition/index.html']
                = Template7.compile(html);
        });
        
        $.get('pages/configuration/index.html', function(html)
        {
            BCapp.__compiledTemplates['pages/configuration/index.html']
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
        
        $.get('pages/misc_segments/form_composer_popup.html', function(html)
        {
            BCapp.__compiledTemplates['pages/misc_segments/form_composer_popup.html']
                = Template7.compile(html);
        });
        
        $.get('pages/misc_segments/form_composer_page.html', function(html)
        {
            BCapp.__compiledTemplates['pages/misc_segments/form_composer_page.html']
                = Template7.compile(html);
        });
        
        $.get('pages/misc_segments/chat_conversation_template.html', function(html)
        {
            BCapp.__compiledTemplates['pages/misc_segments/chat_conversation_template.html']
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
        if( BCglobalSettings.language === '' )
        {
            var browserLanguage = navigator.language;
            if( browserLanguage.length > 2 ) browserLanguage = browserLanguage.substring(0, 2);
            
            if( browserLanguage === 'es' ) BCglobalSettings.language = 'es_LA';
            else                           BCglobalSettings.language = 'en_US';
        }
        
        moment.locale(BCglobalSettings.language);
        
        $('head').append(sprintf(
            '<script type="text/javascript" src="js/language/%s.js"></script>',
            BCglobalSettings.language
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
        
        params.url        = '#add-site-view';
        BCapp.addSiteView = BCapp.framework.addView('.view-add-site', params);
        
        params.main    = true;
        params.url     = '#main-view';
        BCapp.mainView = BCapp.framework.addView('.view-main', params);
        
        BCapp.currentView = BCapp.mainView;
        
        if( BCwebsitesRepository.collection.length == 0 )
        {
            console.log('No websites registered. Showing addition form.');
            
            BCapp.renderWebsiteAdditionForm(function() {
                var $form = $('#add_website_form');
                $form[0].reset();
                $form.ajaxForm({
                    target:       '#ajax_form_target',
                    beforeSubmit: BCwebsitesRepository.websiteAdditionSubmission
                });
                window.tmpInitViewsPostRenderingAction();
                BCapp.showView('.view-add-site', null, false);
            });
            
            return;
        }
        
        console.log(sprintf('%s websites registered. Prepping addition form.', BCwebsitesRepository.collection.length));
        BCapp.renderWebsiteAdditionForm(function() {
            var $form = $('#add_website_form');
            $form.ajaxForm({
                target:       '#ajax_form_target',
                beforeSubmit: BCwebsitesRepository.websiteAdditionSubmission
            });
        });
        
        window.tmpWebsiteToShowInterval = null;
        window.tmpWebsite               = BCwebsitesRepository.collection[0];
        window.tmpWebsiteViewandler     = BCwebsitesRepository.convertHandlerToViewClassName(window.tmpWebsite.handler);
        window.tmpWebsiteToShowSelector = '.' + window.tmpWebsiteViewandler;
        
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
                    
                    BCapp.showFirstWebsite();
                }, 100);
            });
        });
    },
    
    showFirstWebsite: function()
    {
        for( var i in BCwebsitesRepository.collection )
        {
            window.tmpWebsite = BCwebsitesRepository.collection[i];
            
            if( typeof window.tmpWebsite === 'object' ) break;
        }
        
        window.tmpWebsiteViewandler     = BCwebsitesRepository.convertHandlerToViewClassName(window.tmpWebsite.handler);
        window.tmpWebsiteToShowSelector = '.' + window.tmpWebsiteViewandler;
        
        console.log(
            '%cRendering first website. Selector: %s',
            'color: teal;',
            window.tmpWebsiteToShowSelector
        );
        BCapp.showView(window.tmpWebsiteToShowSelector, null, false);
        
        var services        = BCmanifestsRepository.getServicesForWebsite(window.tmpWebsite.URL);
        var serviceHandler  = window.tmpWebsiteViewandler + '-' + services[0].id;
        var serviceSelector = serviceHandler + '-index';
        
        console.log('%cTriggering service %s', 'color: teal;', serviceSelector);
        BCapp.triggerServiceLoad(serviceSelector);
        
        if( services.length > 1 )
            BCapp.setNestedView(window.tmpWebsiteViewandler, serviceHandler);
        else
            BCapp.setNestedView(null);
        
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
        var context   = { registeredSites: BCapp.__buildRegisteredSitesForSelector() };
        var template  = BCapp.getCompiledTemplate('#sidebar_sites_selector');
        var finalHTML = template(context);
        
        $('#left-panel').html(finalHTML);
        
        if( typeof callback === 'function' ) callback();
    },
    
    __buildRegisteredSitesForSelector: function()
    {
        var __return = [];
        
        for( var i in BCwebsitesRepository.collection )
        {
            var website   = BCwebsitesRepository.collection[i];
            var handler   = website.handler;
            var websiteCN = BCwebsitesRepository.convertHandlerToViewClassName(handler);
            
            if( typeof BCmanifestsRepository.collection[website.manifestFileHandler] !== 'undefined' )
            {
                var manifest = BCmanifestsRepository.collection[website.manifestFileHandler];
                __return[__return.length] = {
                    originalIndex:   i,
                    targetView:      '.' + websiteCN,
                    siteLink:        '#' + websiteCN,
                    siteIcon:        manifest.icon,
                    siteShortName:   manifest.shortName,
                    userDisplayName: website.userDisplayName
                };
            }
        }
        
        return __return;
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
    
    renderWebsiteAdditionForm: function(callback)
    {
        var template = 'pages/website_addition/index.html';
        var view     = BCapp.addSiteView;
        var params   = { reload: true, context: {showFeaturedSites: true, featuredSites: []} };
            
        var url = sprintf('%s/index-%s.json?wasuuup=%s',
            BCapp.featuredSitesInfoURLprefix, BClanguage.iso, BCtoolbox.wasuuup()
        );
        console.log('%cFetching featured sites list from %s...', 'color: green', url);
        $.getJSON(url, function(data)
        {
            console.log('%cFEatured sites list loaded.', 'color: green');
            params.context.featuredSites = data.featuredSites;
            
            BCapp.renderPage(template, view, params, callback);
        })
        .fail(function($xhr, status, error)
        {
            console.log('%cFailed to load featured sites list!', 'color: maroon');
            
            params.context.showFeaturedSites             = false;
            params.context.cannotGetFeaturedSitesMessage = sprintf(
                BClanguage.cannotGetFeaturedSitesList,
                error
            );
            
            BCapp.renderPage(template, view, params, callback);
        });
    },
    
    renderPage: function(templateFileName, view, params, callback)
    {
        var languageFileName = sprintf('%s.%s.json', templateFileName, BClanguage.iso);
        $.getJSON(languageFileName, function(pageLanguage)
        {
            if( typeof params.context === 'undefined' ) params.context = {};
            for(var i in pageLanguage) params.context[i]  = pageLanguage[i];
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
                if( typeof website.meta === 'undefined' ) continue;
                if( website.meta == null ) continue;
                
                if( typeof service.requires === 'string' )
                {
                    if( typeof website.meta[service.requires] === 'undefined' )
                    {
                        continue;
                    }
                }
                
                if( typeof service.requires === 'object' )
                {
                    var req_meta = Object.keys(service.requires)[0];
                    var req_opts = service.requires[req_meta];
                    
                    if( typeof website.meta[req_meta] === 'undefined' ) continue;
                    
                    var found = false;
                    for(i in req_opts)
                    {
                        var value = req_opts[i];
                        if( website.meta[req_meta] === value )
                        {
                            found = true;
                            
                            break;
                        }
                    }
                    
                    if( ! found ) continue;
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
                websiteHandler: website.handler,
                icon:         BChtmlHelper.convertIcon(service.icon),
                tabLink:      sprintf('#%s-%s', websiteMainViewClassName, service.id),
                tabTarget:    sprintf('%s-%s', websiteMainViewClassName, service.id),
                activeTab:    (parseInt(i) === 0 ? 'active' : ''),
                pageHandler:  sprintf('%s-%s-index', websiteMainViewClassName, service.id),
                markup:       BCapp.__getServiceMarkup(website, service),
                pageClass:    serviceClass === 'feed-service' ? 'feed-service-page' : '',
                serviceClass: serviceClass,
                contentClass: serviceClass === 'feed-service' ? 'infinite-scroll pull-to-refresh-content' : '',
                isFeed:       serviceClass === 'feed-service',
                navbarClass:  service.options.hasNavbar  ? 'service-navbar-fixed'  : '',
                toolbarClass: service.options.hasToolbar ? 'service-toolbar-fixed' : ''
            };
            
            service.meta.floatingActionButtonTriggerClass         = '';
            service.meta.floatingActionButtonTriggerString        = '';
            service.meta.floatingActionButtonTriggerProcessedIcon = '';
            
            var meta_user_level = 0;
            if( website.meta )
                if( website.meta.user_level )
                    meta_user_level = website.meta.user_level;
            
            if( typeof service.options.showFloatingActionButton === 'undefined' )
                service.options.showFloatingActionButton = false;
            
            if( service.options.showFloatingActionButton && website.userName === '' )
                service.options.showFloatingActionButton = false;
            
            if(
                service.options.showFloatingActionButton &&
                typeof service.options.floatingActionButtonUserLevelsAllowed !== 'undefined'
            ) {
                if( service.options.floatingActionButtonUserLevelsAllowed.length > 0 )
                {
                    service.options.showFloatingActionButton = false;
                    
                    for( var i2 in service.options.floatingActionButtonUserLevelsAllowed )
                    {
                        var allowed_level = parseInt(service.options.floatingActionButtonUserLevelsAllowed[i2]);
                        
                        if( parseInt(meta_user_level) === allowed_level )
                        {
                            service.options.showFloatingActionButton = true;
                            
                            break;
                        }
                    }
                }
                
                if( service.options.showFloatingActionButton )
                {
                    service.meta.floatingActionButtonTriggerClass
                        = service.options.floatingActionButtonTrigger.class;
                    
                    service.meta.floatingActionButtonTriggerString
                        = JSON.stringify(service.options.floatingActionButtonTrigger);
                    
                    service.meta.floatingActionButtonTriggerProcessedIcon
                        = BChtmlHelper.convertIcon(service.options.floatingActionButtonTrigger.icon);
                }
            }
            
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
        
        var $view = $('#' + websiteMainViewClassName);
        $view.data('website', website);
        $view.data('manifest', manifest);
        for(var x in renderingServices)
        {
            var $servicePage = $view.find('#' + renderingServices[x].meta.tabTarget);
            
            $servicePage.data('service',  service);
            $servicePage.data('website',  website);
            $servicePage.data('manifest', manifest);
        }
        
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
        // params.domCache =  renderingServices.length === 1;
        params.url      = '#' + websiteMainViewClassName;
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
                params.url      = '#' + serviceViewName;
                // params.domCache = true;
                var view  = BCapp.framework.addView('.' + serviceViewName, params);
                
                if( typeof BCapp.nestedViewsCollection[websiteMainViewClassName] === 'undefined' )
                    BCapp.nestedViewsCollection[websiteMainViewClassName] = {};
                
                BCapp.nestedViewsCollection[websiteMainViewClassName][serviceViewName] = view;
            }
        }
        // console.log('Nested views collection: ', BCapp.nestedViewsCollection);
        
        BCapp.__addWebsiteMenu(website.handler, renderingServices, websiteMainViewClassName, manifest);
        
        if( typeof window.tmpAddWebsiteViewCallback === 'function' )
            window.tmpAddWebsiteViewCallback();
    },
    
    /**
     * Manifest should have services with metadata already forged!
     *
     * @param {string}                       websiteHandler
     * @param {BCwebsiteServiceDetailsClass} manifestServices
     * @param {string}                       websiteMainViewClassName
     * @param {BCwebsiteManifestClass}       manifest
     */
    __addWebsiteMenu: function(websiteHandler, manifestServices, websiteMainViewClassName, manifest)
    {
        var context = {
            services:       manifestServices,
            websiteHandler: websiteHandler,
            websiteCN:      websiteMainViewClassName,
            manifest:       manifest
        };
        var template = BCapp.getCompiledTemplate('#sidebar_menu_template');
        
        BCapp.websiteMenusCollection[websiteMainViewClassName] = template(context);
        console.log(sprintf('Added menu for %s to the menus collection.', websiteMainViewClassName));
    },
    
    showView: function( selector, callback, triggerAutoLoad )
    {
        if( typeof triggerAutoLoad === 'undefined' ) triggerAutoLoad = true;
        
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
            BCapp.currentView       = BCapp.mainView;
            BCapp.currentNestedView = null;
        }
        else if( selector === '.view-add-site' )
        {
            BCapp.currentView       = BCapp.addSiteView;
            BCapp.currentNestedView = null;
            BCapp.addSiteView.router.back({animatePages: false});
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
        
        var $page;
        var $activeNestedView = $(selector).find('.view.active');
        if( $activeNestedView.length === 0 )
        {
            BCapp.currentNestedView = null;
            console.log('%cCurrent service doesn\'t have nested views. Clearing current nested view.', 'color: magenta;');
            $page = $(BCapp.currentView.selector).find('.service-page');
            if( typeof $page.attr('data-initialized') === 'undefined' && triggerAutoLoad )
            {
                if( typeof $page.attr('data-page') !== 'undefined' )
                {
                    console.log(
                        '%c>>> Triggering service load on page [%s]', 'color: green;', $page.attr('data-page')
                    );
                    BCapp.triggerServiceLoad( $page.attr('data-page') );
                }
            }
        }
        else
        {
            var activeNestedViewId = $activeNestedView.attr('id');
            BCapp.setNestedView(menuKey, activeNestedViewId);
            
            $page = $(BCapp.currentView.selector).find('.service-page:visible');
            if( typeof $page.attr('data-initialized') === 'undefined' && triggerAutoLoad )
            {
                console.log(
                    '%c>>> Triggering service load on nested page [%s] of view %s',
                    'color: green;',
                    $page.attr('data-page'),
                    BCapp.currentView.selector
                );
                BCapp.triggerServiceLoad( $page.attr('data-page') );
            }
        }
        
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
        $('#add_website_form').find('input[name=use_facebook_login]').val('false');
        
        if( typeof window.tmpViewToReturnWhenCancellingWebsiteAddition === 'undefined' )
        {
            BCapp.showFirstWebsite();
            
            return;
        }
        
        if( $(window.tmpViewToReturnWhenCancellingWebsiteAddition.selector).length > 0 )
        {
            BCapp.showView(window.tmpViewToReturnWhenCancellingWebsiteAddition.selector);
            
            return;
        }
        
        BCapp.showFirstWebsite();
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
        if( service.type === 'feed/cards:reddit'   ) return BCapp.__getCardedServiceMarkup(website, service);
        
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
            tzoffset:         0 - (new Date().getTimezoneOffset() / 60),
            since:            '',
            until:            '',
            wasuuup:          BCtoolbox.wasuuup()
        };
        
        var containerId = 'cards_' + BCtoolbox.wasuuup();
        if( typeof window.tmpServiceFeeds === 'undefined' )
            window.tmpServiceFeeds = {};
        
        window.tmpServiceFeeds[containerId] = {
            url:     url,
            params:  params,
            website: website,
            service: service
        };
        
        // console.log(service);
        var html = $('template[data-type="feed-service-container"]').html();
        return sprintf(html, containerId, service.type);
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
            if( $(this).closest('.service-page').attr('data-initialized') ) return;
            
            var src = $(this).attr('data-src');
            $(this).attr('src', src);
            $(this).closest('.service-page').attr('data-initialized', 'true');
            
            console.log(sprintf('Iframe for %s initialized.', pageHandler));
            BCtoolbox.showFullPageLoader();
        });
        
        $target.find('.bc-ajaxified-service').each(function()
        {
            var $container = $(this);
            if( $container.closest('.service-page').attr('data-initialized') ) return;
            
            BCapp.__loadAjaxifiedService($container, true);
        });
        
        $target.find('.bc-service-feed').each(function()
        {
            var $container = $(this);
            if( $container.closest('.service-page').attr('data-initialized') ) return;
            
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
        
        params.media_processor_args = BCglobalSettings.getArgsForRemoteMediaProcessor();
        $.get(url, params, function(html)
        {
            if( showIndicator ) BCtoolbox.hideFullPageLoader();
            
            var manifest = BCmanifestsRepository.getForWebsite(website.URL);
            var context  = { website: website, service: service, manifest: manifest, url: url };
            var template = Template7.compile(html);
            $container.html( template(context) );
            $container.closest('.service-page').attr('data-initialized', 'true');
            
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
        
        params.since = '';
        params.until = '';
        
        console.log(sprintf('Fetching %s...', url));
        if( showIndicator ) BCtoolbox.showFullPageLoader();
        
        params.media_processor_args = BCglobalSettings.getArgsForRemoteMediaProcessor();
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
            
            BChtmlHelper.renderFeed($container, website, service, data, '', true);
            $container.closest('.service-page').attr('data-initialized', true);
        })
        .fail(function($xhr, status, error)
        {
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
        
        var positions = [];
        if( helpers.length === 1 ) positions = ['right'];
        if( helpers.length === 2 ) positions = ['left', 'right'];
        if( helpers.length === 3 ) positions = ['left', 'center', 'right'];
        
        for(var i in helpers)
        {
            var helper   = helpers[i];
            var position = positions[i];
            
            if( helper.type === 'selector' )
            {
                BChtmlHelper.createNavbarSelector($bar, position, helper, containerId);
            }
            
            if( helper.type === 'searchbox' )
            {
                BChtmlHelper.createNavbarSearchHelper($bar, position, helper, containerId);
            }
        }
        
        $bar.attr('initialized', 'true');
    },
    
    setNestedView: function(mainViewSelector, websiteServiceSelector)
    {
        console.log('Setting nested view to ' + mainViewSelector, ' / ' + websiteServiceSelector);
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
        if( device.platform === 'browser' )
        {
            var $popup = $('#window_open_override_template');
            $popup.find('.navbar .title').text(URL);
            BCtoolbox.showFullPageLoader();
            $popup.find('iframe').attr('src', URL);
            BCapp.framework.popup($popup);
            
            return;
        }
        
        var options = [
            'location=yes'
            , 'clearcache=yes'
            , 'clearsessioncache=yes'
            , 'toolbar=yes'
            , 'enableViewportScale=yes'
            , 'hardwareback=yes'
            , 'mediaPlaybackRequiresUserAction=yes'
            , 'allowInlineMediaPlayback=yes'
            , 'toolbarposition=top'
            , 'closebuttoncaption=' + BClanguage.actions.close
        ];
        
        if( typeof name === 'undefined' ) name = '_blank';
        
        window.tmpOpenedInAppBrowser = cordova.InAppBrowser.open(URL, name, options.join(','));
    
        window.tmpOpenedInAppBrowser.addEventListener('loadstop', function(event)
        {
            if (event.url.match("/BCM/CLOSE_FRAME"))
                window.tmpOpenedInAppBrowser.close();
        });
    },
    
    triggerAction: function( trigger, websiteHandler, serviceId )
    {
        var $trigger = $(trigger);
        var tdata    = new BCactionTriggerClass(JSON.parse($trigger.find('.bc-action-data').html()));
        
        if( typeof websiteHandler === 'undefined' ) websiteHandler = '';
        if( typeof serviceId      === 'undefined' ) serviceId      = '';
        
        var website, service, manifest;
        
        var $dataContainer = $trigger.closest('.item-data-container');
        if( $dataContainer.length > 0 )
        {
            website  = $dataContainer.data('website');
            service  = $dataContainer.data('service');
            manifest = $dataContainer.data('manifest');
        }
        else
        {
            website  = BCwebsitesRepository.getByHandler(websiteHandler);
            manifest = BCmanifestsRepository.getForWebsite(website.URL);
            service  = BCmanifestsRepository.getService(website.URL, serviceId);
        }
        
        if( typeof manifest.actionsRegistry[tdata.action_id] === 'undefined' )
        {
            BCapp.framework.alert(
                BClanguage.actionsController.unregisteredAction.message,
                BClanguage.actionsController.unregisteredAction.title
            );
            
            return;
        }
        
        var action = new BCactionClass(manifest.actionsRegistry[tdata.action_id]);
        
        if( typeof action.options === 'undefined' ) action.options = [];
        
        // console.log(action.options);
        if( tdata.options )
            for(var i in tdata.options)
                action.options[i] = tdata.options[i];
        // console.log(action.options);
        
        var url    = action.script_url;
        var params = tdata.params ? tdata.params : {};
        
        params.bcm_force_session = 'true';
        params.bcm_output_type   = 'HTML';
        params.bcm_access_token  = website.accessToken;
        params.bcm_platform      = BCapp.os;
        params.wasuuup           = BCtoolbox.wasuuup();
        
        if( action.options.requires_confirmation )
        {
            var message = typeof action.options.confirmation_message === 'string'
                        ? action.options.confirmation_message
                        : BClanguage.actionsController.defaultConfirmationPrompt.message;
            
            BCapp.framework.confirm(
                message,
                BClanguage.actionsController.defaultConfirmationPrompt.title,
                function() {
                    BCapp.__executeAction($trigger, tdata, website, service, manifest, action, url, params);
                }
            );
            
            return;
        }
        
        BCapp.__executeAction($trigger, tdata, website, service, manifest, action, url, params);
    },
    
    __executeAction: function($trigger, tdata, website, service, manifest, action, url, params)
    {
        console.log('%cCalled action: %s', 'color: blue;', action.id);
        
        switch( action.call_method )
        {
            case 'frame':
            {
                if( Object.keys(params).length > 0 )
                {
                    if( url.indexOf('?') < 0 ) url = url + '?';
                    else                       url = url + '&';
                    url = url + $.param(params);
                }
                
                console.log('%cOpening action script: %s', 'color: blue;', url);
                BCapp.openURLinPopup(url);
                break;
            }
            case 'get':
            {
                console.log('%cInvoking action script: %s', 'color: blue;', url);
                console.log('%cParams: %s', 'color: blue;', JSON.stringify(params));
                BCtoolbox.showFullPageLoader();
                $.get(url, params, function(response)
                {
                    BCtoolbox.hideFullPageLoader();
                    
                    if( response !== 'OK' )
                    {
                        BCapp.framework.alert(response, manifest.shortName);
                        return;
                    }
                    
                    if( typeof action.options.success_notification === 'string' )
                        BCtoolbox.addNotification(action.options.success_notification);
                    
                    if( action.options.remove_parent_on_success )
                        $trigger.closest('.bc-actions-parent').hide('blind', 100, function() { $(this).remove(); });
                    
                    if( action.options.go_back_on_success )
                    {
                        var view = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
                        view.router.back();
                    }
                });
                break;
            }
            case 'posting_form_composer':
            { 
                BChtmlHelper.openHTMLformComposer(action, url, params, 'page', website, service, manifest);
                break;
            }
            default:
            {    
                BCapp.framework.alert(
                    BClanguage.actionsController.invalidCallMethod.message,
                    BClanguage.actionsController.invalidCallMethod.title
                );
                break;
            }
        }
    },
    
    iframeEventManager: function(e)
    {
        if( device.platform !== 'browser' ) return;
        
        console.log('%cBrowser iframe event triggered: %s', 'color: white; background-color: blue;', e.data);
        
        if( e.data == 'BCM:CLOSE_FRAME' )
        {
            var $popup = $('#window_open_override_template');
            $popup.find('iframe').attr('src', 'about:blank');
            BCapp.framework.closeModal();
        }
    },
    
    openConfigurationPage: function()
    {
        var params = {
            reload:  true,
            context: {
                __sitesSelectorItems: BCapp.__buildRegisteredSitesForSelector()
            }
        };
        
        BCapp.renderPage(
            'pages/configuration/index.html',
            BCapp.mainView,
            params,
            function() { BCapp.__prepareConfigurationPage(); BCapp.showView('.view-main'); }
        );
    },
    
    /**
     * @private
     */
    __prepareConfigurationPage: function()
    {
        var $page = $('.page[data-page="global-configuration"]');
        var $group, $item;
        
        // Appearance: layout theme
        $group = $page.find('li[data-setting="theme"]');
        $group.find(sprintf('input[name="theme"][value="%s"]', BCglobalSettings.theme)).prop('checked', true);
        $group.find('input[name="theme"]').bind('change', function()
        {
            var $this = $(this);
            var name  = $this.attr('name');
            var value = $this.val();
            BCglobalSettings.set(name, value);
        });
        
        // Appearance: language
        $group = $page.find('li[data-setting="language"]');
        $item  = $group.find(sprintf('select[name="language"] option[value="%s"]', BCglobalSettings.language));
        $item.prop('selected', true);
        $group.find(sprintf('.selected-item-label')).text($item.text());
        $group.find('select[name="language"]').bind('change', function()
        {
            var value = $(this).find('option:selected').val();
            BCglobalSettings.set('language', value);
            
            BCapp.framework.confirm(
                BClanguage.languageSwitchingConfirmation.message,
                BClanguage.languageSwitchingConfirmation.title,
                function() { location.reload(); }
            )
        });
        
        // Media: images
        $group = $page.find('.media-images');
        
        // Media: max image width
        $item = $group.find(sprintf('select[name="maxImageWidth"] option[value="%s"]', BCglobalSettings.maxImageWidth));
        $item.prop('selected', true);
        $group.find(sprintf('li[data-setting="maxImageWidth"] .selected-item-label')).text($item.text());
        $group.find('select[name="maxImageWidth"]').bind('change', function()
        {
            var value = $(this).find('option:selected').val();
            BCglobalSettings.set('maxImageWidth', value);
        });
        
        // Media: max JPEG quality
        $item = $group.find('input[name="maxJPEGquality"]');
        $item.val( BCglobalSettings.maxJPEGquality );
        $item.bind('change', function()
        {
            var value = $(this).val();
            BCglobalSettings.set('maxJPEGquality', value);
        });
        
        // Media: videos
        $group = $page.find('.media-videos');
        
        // Media: max video width
        $item = $group.find(sprintf('select[name="maxVideoWidth"] option[value="%s"]', BCglobalSettings.maxVideoWidth));
        $item.prop('selected', true);
        $group.find(sprintf('li[data-setting="maxVideoWidth"] .selected-item-label')).text($item.text());
        $group.find('select[name="maxVideoWidth"]').bind('change', function()
        {
            var value = $(this).find('option:selected').val();
            BCglobalSettings.set('maxVideoWidth', value);
        });
        
        // Media: max video bitrate
        $item = $group.find(sprintf('select[name="maxVideoBitrate"] option[value="%s"]', BCglobalSettings.maxVideoBitrate));
        $item.prop('selected', true);
        $group.find(sprintf('li[data-setting="maxVideoBitrate"] .selected-item-label')).text($item.text());
        $group.find('select[name="maxVideoBitrate"]').bind('change', function()
        {
            var value = $(this).find('option:selected').val();
            BCglobalSettings.set('maxVideoBitrate', value);
        });
        
        // Websites Sorter
        if(BCwebsitesRepository.collection.length < 2 )
        {
            $page.find('.websites-selector').hide();
        }
        else
        {
            $page.find('.websites-selector').show();
            BCapp.framework.sortableOpen('#websites-selector-sorter');
            $('#websites-selector-sorter').on('sortable:sort', BCapp.__processWebsiteReordering);
        }
    },
    
    /**
     * @private
     */
    __processWebsiteReordering: function()
    {
        var newOrder = [], index = 0, $sorter = $('#websites-selector-sorter');
        $sorter.find('li').each(function()
        {
            newOrder[index] = $(this).attr('data-original-index');
            index++;
        });
        
        var newCollection = [];
        for(var i in newOrder)
            newCollection[newCollection.length] = BCwebsitesRepository.collection[newOrder[i]];
        
        BCwebsitesRepository.collection = newCollection;
        console.log('Websites successfully reordered.');
        BCapp.renderSiteSelector();
        BCwebsitesRepository.saveWebsitesRegistry();
        
        index = 0;
        $sorter.find('li').each(function()
        {
            $(this).attr('data-original-index', index);
            index++;
        });
    }
};

var eventMethod  = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer      = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
eventer(messageEvent,function(e) { BCapp.iframeEventManager(e); }, false);

document.addEventListener('deviceready', BCapp.init, false);
