
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

var BCapp = {
    
    version: Template7.global.appVersion,
    
    framework: f7,
    
    settings: new BCglobalSettingsClass(),
    
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
        
        BCapp.os = BCapp.framework.device.os;
        
        $('body').attr('data-os', BCapp.os);
        
        BCapp.__adjustOrientation();
        $(window).resize(function() { BCapp.__adjustOrientation(); });
        
        var $progress = $('.bc-loader-container .bc-progress-bar');
        $progress.circleProgress();
        
        BCapp.__setLanguage();
        $progress.circleProgress('value', 0.25);
        
        BCapp.__loadRequirements();
        $progress.circleProgress('value', 0.50);
        
        BCeventHandlers.init();
        $progress.circleProgress('value', 0.75);
        
        BCapp.__initViews(function() { $progress.circleProgress('value', 1); });
    },
    
    __adjustOrientation: function() {
        var orientation = $(window).width() <= $(window).height() ? 'portrait' : 'landscape';
        $('body').attr('data-orientation', orientation);
    },
    
    __setLanguage: function() {
        
        var browserLanguage = navigator.language;
        if( browserLanguage.length > 2 ) browserLanguage = browserLanguage.substring(0, 2);
        
        if( browserLanguage === 'es' ) BCapp.settings.language = 'es_LA';
        if( browserLanguage === 'en' ) BCapp.settings.language = 'en_US';
        
        $('head').append(sprintf(
            '<script type="text/javascript" src="js/language/%s.js"></script>', BCapp.settings.language
        ));
        BCapp.language            = Language;
        Template7.global.language = Language;
        
        for(var i in BCapp.language.frameworkCaptions)
            BCapp.framework.params[i] = BCapp.language.frameworkCaptions[i];
        
        $('head title').text(BCapp.language.appName.replace('{{platform}}', BCapp.os));
    },
    
    __loadRequirements: function() {
        if( BCapp.os === 'ios' ) {
            $('head').append('<link rel="stylesheet" href="lib/framework7-icons/css/framework7-icons.css">');
        }
        else {
            $('#f7_ui_styles').attr('href', 'lib/framework7/css/framework7.material.min.css');
            $('#f7_ui_colors').attr('href', 'lib/framework7/css/framework7.material.colors.min.css');
        }
    },
    
    __initViews: function(preRenderingAction) {
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
        
        params.name    = 'main';
        BCapp.mainView = BCapp.framework.addView('.view-main',     params);
        
        params.name       = 'addSite';
        BCapp.addSiteView = BCapp.framework.addView('.view-add-site', params);
        
        preRenderingAction();
        
        BCwebsiteAddition.renderWebsiteAdditionPage();
    },
    
    renderPage: function(templateFileName, view, params, callback) {
        var languageFileName = sprintf('%s.%s.json', templateFileName, BCapp.language.iso);
        $.getJSON(languageFileName, function(pageLanguage) {
            params.context = pageLanguage;
            $.get(templateFileName, function(sourceHTML) {
                params.template = Template7.compile(sourceHTML);
                view.router.load(params);
                
                if( typeof callback === 'function' ) callback();
            });
        });
    }
};

document.addEventListener('deviceready', BCapp.init, false);