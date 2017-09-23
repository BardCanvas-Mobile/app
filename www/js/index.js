
// Global helpers
var f7 = new Framework7();
var $$ = Dom7;

var app = {
    
    /**
     * @var {Window.Framework7}
     */
    framework: null,
    
    /**
     * @var {object}
     */
    mainView: null,
    
    /**
     * Application Constructor
     */
    initialize: function() {
        // Common events: 'load', 'deviceready', 'offline', and 'online'
        document.addEventListener('deviceready', this._onDeviceReady, false);
    },
    
    /**
     * deviceready Event Handler - private
     * 
     * The scope of 'this' is the event. In order to call the 'receivedEvent'
     * function, we must explicitly call 'app.receivedEvent(...);'
     */
    _onDeviceReady: function() {
        
        app.framework = new Framework7();
        
        var os     = app.framework.device.os;
        var file   = sprintf('templates/%s/main-view.html', os);
        
        app._loadPlatformCSS();
        $$.get(file, function(html) {
            console.log(file, ' loaded');
            $$('.view-main').html(html);
            app.mainView = app.framework.addView('.view-main');
        });
    },
    
    _loadPlatformCSS: function() {
        
        var os = app.framework.device.os;
        console.log( os );
        
        if( os === 'ios' ) return;
        
        $$('head')
            .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">')
            .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">');
    }
};

// Let's go!
app.initialize();
