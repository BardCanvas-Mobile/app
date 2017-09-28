
// Global helpers
var f7 = new Framework7();
var $$ = Dom7;

window.bcapp = {
    
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
    
    init: function() {
        bcapp.__adjustOrientation();
        $(window).resize(function() { bcapp.__adjustOrientation(); });
        
        var $progress = $('.loader-container .bc-progress-bar');
        $progress.circleProgress();
        
        bcapp.__setLanguage();
        $progress.circleProgress('value', 0.25);
        
        bcapp.__loadRequirements();
        $progress.circleProgress('value', 0.50);
        
        bcapp.eventHandlers.init();
        $progress.circleProgress('value', 0.75);
        
        bcapp.__initMainView(function() { $progress.circleProgress('value', 1); });
    },
    
    __adjustOrientation: function() {
        var orientation = $(window).width() <= $(window).height() ? 'portrait' : 'landscape';
        $('body').attr('data-orientation', orientation);
    },
    
    __setLanguage: function() {
        
        var browserLanguage = navigator.language;
        if( browserLanguage === 'es' ) bcapp.settings.language = 'es_LA';
        if( browserLanguage === 'en' ) bcapp.settings.language = 'en_US';
        
        $('head').append(sprintf(
            '<script type="text/javascript" src="js/language/%s.js"></script>', bcapp.settings.language
        ));
        bcapp.language = Language;
        
        $('head title').text(bcapp.language.appName.replace('{{platform}}', bcapp.framework.device.os));
    },
    
    __loadRequirements: function() {
        var os = bcapp.framework.device.os;
        if( os === 'ios' ) {
            $$('head')
                .append('<link rel="stylesheet" href="lib/framework7-icons/css/framework7-icons.css">')
            ;
        }
        else {
            $$('head')
                .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">')
                .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">')
                .append('<link rel="stylesheet" href="lib/material-design-icons/material-icons.css">')
            ;
        }
    },
    
    __initMainView: function(preRenderingAction) {
        var os     = bcapp.framework.device.os;
        var params = {};
        switch( os ) {
            case 'ios':
                params = {
                    swipeBackPage: true
                };
                break;
            case 'android':
                params = {
                    material:       true,
                    materialRipple: true
                };
                break;
        }
        
        bcapp.mainView = bcapp.framework.addView('.view-main', params);
        preRenderingAction();
        
        bcapp.toolbox.renderPage('main-view.html', bcapp.mainView, {
            reload:  true,
            context: {
                os:      os,
                welcome: bcapp.language.welcome,
                about:   bcapp.language.about
            }
        });
    }
};

document.addEventListener('deviceready', bcapp.init, false);
