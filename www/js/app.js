
// Global helpers
var f7 = new Framework7();

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
    
    version: Template7.global.appVersion,
    
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
     * TODO: Forge this!
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
        ImgCache.init(function ()
        {
            BCapp.imgCacheEnabled = true;
        },
        function ()
        {
            BCapp.imgCacheEnabled = false;
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
        $('body').attr('data-orientation', orientation);
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
        var params = { main: true };
        switch( BCapp.os ) {
            case 'ios':
                params.swipeBackPage = true;
                break;
            case 'android':
                params.material       = true;
                params.materialRipple = true;
                break;
        }
        
        BCapp.mainView    = BCapp.framework.addView('.view-main', params);
        BCapp.addSiteView = BCapp.framework.addView('.view-add-site', params);
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
                    postRenderingAction();
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
        window.tmpWebsiteToShowSelector = '.view-zonadivascom';
        window.tmpWebsite               = BCwebsitesRepository.collection[0];
        
        console.log('Rendering site selector and adding website views.');
        BCapp.renderSiteSelector(function()
        {
            BCapp.__renderAllWebsiteViews(function()
            {
                postRenderingAction();
                
                window.tmpWebsiteToShowInterval = setInterval(function()
                {
                    if( $(window.tmpWebsiteToShowSelector).length === 0 ) return;
                    
                    clearInterval(window.tmpWebsiteToShowInterval);
                    
                    console.log('Rendering first website (here the wall should be rendered).');
                    BCapp.showView(window.tmpWebsiteToShowSelector);
                }, 100);
            });
        });
    },
    
    renderSiteSelector: function(callback)
    {
        $.get('pages/misc_segments/sites_selector.html', function(sourceHTML)
        {
            var context = { registeredSites: [] };
            for( var i in BCwebsitesRepository.collection )
            {
                var website   = BCwebsitesRepository.collection[i];
                var handler   = website.handler;
                var websiteCN = 'view-' + handler.replace(/[\-\.\/]/g, '');
                
                if( typeof BCwebsitesRepository.manifests[handler] !== 'undefined' )
                {
                    var manifest = BCwebsitesRepository.manifests[handler];
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
        });
    },
    
    __renderAllWebsiteViews: function(callback) 
    {
        for( var i in BCwebsitesRepository.collection )
        {
            var website   = BCwebsitesRepository.collection[i];
            var handler   = website.handler;
            var websiteCN = 'view-' + handler.replace(/[\-\.\/]/g, '');
            
            if( typeof BCwebsitesRepository.manifests[handler] !== 'undefined' )
            {
                var manifest = BCwebsitesRepository.manifests[handler];
                
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
     */
    addWebsiteView: function(website, manifest, websiteMainViewClassName)
    {
        // TODO: Check different use cases for templates
        var file = 'pages/site_templates/site_with_service_tabs.html';
        $.get(file, function(sourceHTML)
        {
            // Prep icons
            for(var i in manifest.services)
            {
                var service  = manifest.services[i];
                service.meta = {
                    icon:        BCapp.__convertIcon(service.icon),
                    tabLink:     sprintf('#%s-%s', websiteMainViewClassName, service.id),
                    tabTarget:   sprintf('%s-%s', websiteMainViewClassName, service.id),
                    activeTab:   (parseInt(i) === 0 ? 'active' : ''),
                    pageHandler: sprintf('%s-%s-index', websiteMainViewClassName, service.id),
                    markup:      BCapp.__getServiceMarkup(service)
                };
            }
            
            var context = {
                websiteMainViewClassName: websiteMainViewClassName,
                services:                 manifest.services,
                navbarTitle:              sprintf('%s - %s', manifest.shortName, website.userDisplayName)
            };
            
            // console.log(context);
            var template = Template7.compile(sourceHTML);
            var finalHTML = template(context);
            $('.views').append(finalHTML);
            
            var params = {};
            switch( BCapp.os ) {
                case 'ios':
                    params.swipeBackPage = true;
                    break;
                case 'android':
                    params.material       = true;
                    params.materialRipple = true;
                    break;
            }
            
            params.name = websiteMainViewClassName;
            BCapp.viewsCollection[websiteMainViewClassName]
                = BCapp.framework.addView('.' + websiteMainViewClassName, params);
            console.log(sprintf('%s view rendered.', websiteMainViewClassName));
            
            BCapp.__addWebsiteMenu(website, manifest, websiteMainViewClassName);
        });
    },
    
    /**
     * Manifest should have services with metadata already forged!
     * 
     * @param {BCwebsiteClass}         website
     * @param {BCwebsiteManifestClass} manifest
     * @param {string}                 websiteMainViewClassName
     */
    __addWebsiteMenu: function(website, manifest, websiteMainViewClassName)
    {
        var file = 'pages/misc_segments/right_sidebar.html';
        $.get(file, function(sourceHTML)
        {
            var context  = { services: manifest.services, websiteHandler: website.handler };
            var template = Template7.compile(sourceHTML);
            // var selector = 'view-' + handler.replace(/[\-\.\/]/g, '');
            BCapp.websiteMenusCollection[websiteMainViewClassName] = template(context);
            console.log(sprintf('Added menu for %s to the menus collection.', websiteMainViewClassName));
        });
    },
    
    showView: function( selector, callback )
    {
        console.log('Actual view: ' + BCapp.currentView.selector);
        
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
        $('#cancel_website_addition').show();
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
     * @param {BCwebsiteServiceDetailsClass} service
     * @private
     */
    __getServiceMarkup: function(service)
    {
        if( service.isOnline )
        {
            var html      = $('#iframed_service_template').html();
            var context   = { url: service.url };
            var template  = Template7.compile(html);
            
            return template(context);
        }
    }
};

document.addEventListener('deviceready', BCapp.init, false);
