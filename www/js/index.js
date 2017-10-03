
// Global helpers
var f7 = new Framework7();

// noinspection JSUnusedGlobalSymbols
var $$ = Dom7;

Template7.global = {
    appVersion: '0.0.1',
    isIOS:      f7.device.os === 'ios',
    isAndroid:  f7.device.os !== 'ios',
    os:         f7.device.os,
    langauge:   {}
};

window.bcapp = {
    
    version: Template7.global.appVersion,
    
    framework: f7,
    
    settings: GlobalSettings,
    
    toolbox: Toolbox,
    
    eventHandlers: EventHandlers,
    
    networkType:      null,
    networkConnected: false,
    
    batteryIsLow: false,
    
    /**
     * @var {Language}
     */
    language: null,
    
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
    
    init: function() {
        
        bcapp.os = bcapp.framework.device.os;
        
        $('body').attr('data-os', bcapp.os);
        
        bcapp.__adjustOrientation();
        $(window).resize(function() { bcapp.__adjustOrientation(); });
        
        var $progress = $('.bc-loader-container .bc-progress-bar');
        $progress.circleProgress();
        
        bcapp.__setLanguage();
        $progress.circleProgress('value', 0.25);
        
        bcapp.__loadRequirements();
        $progress.circleProgress('value', 0.50);
        
        bcapp.eventHandlers.init();
        $progress.circleProgress('value', 0.75);
        
        bcapp.__initViews(function() { $progress.circleProgress('value', 1); });
    },
    
    __adjustOrientation: function() {
        var orientation = $(window).width() <= $(window).height() ? 'portrait' : 'landscape';
        $('body').attr('data-orientation', orientation);
    },
    
    __setLanguage: function() {
        
        var browserLanguage = navigator.language;
        if( browserLanguage.length > 2 ) browserLanguage = browserLanguage.substring(0, 2);
        
        if( browserLanguage === 'es' ) bcapp.settings.language = 'es_LA';
        if( browserLanguage === 'en' ) bcapp.settings.language = 'en_US';
        
        $('head').append(sprintf(
            '<script type="text/javascript" src="js/language/%s.js"></script>', bcapp.settings.language
        ));
        bcapp.language = Language;
        Template7.global.language = Language;
        
        for(var i in bcapp.language.frameworkCaptions)
            bcapp.framework.params[i] = bcapp.language.frameworkCaptions[i];
        
        $('head title').text(bcapp.language.appName.replace('{{platform}}', bcapp.os));
    },
    
    __loadRequirements: function() {
        if( bcapp.os === 'ios' ) {
            $('head').append('<link rel="stylesheet" href="lib/framework7-icons/css/framework7-icons.css">');
        }
        else {
            $('#f7_ui_styles').attr('href', 'lib/framework7/css/framework7.material.min.css');
            $('#f7_ui_colors').attr('href', 'lib/framework7/css/framework7.material.colors.min.css');
        }
    },
    
    __initViews: function(preRenderingAction) {
        var params = { main: true };
        switch( bcapp.os ) {
            case 'ios':
                params.swipeBackPage = true;
                break;
            case 'android':
                params.material       = true;
                params.materialRipple = true;
                break;
        }
        
        params.name         = 'main';
        bcapp.mainView      = bcapp.framework.addView('.view-main',     params);
        
        params.name         = 'addSite';
        bcapp.addSiteView   = bcapp.framework.addView('.view-add-site', params);
        
        preRenderingAction();
        
        bcWebsiteAddition.renderWebsiteAdditionPage();
    }
};

document.addEventListener('deviceready', bcapp.init, false);
