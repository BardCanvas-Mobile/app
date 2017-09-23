
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
        
        this.framework = new Framework7();
        
        this.mainView = this.framework.addView('.view-main', {
            // Because we use fixed-through navbar we can enable dynamic navbar
            dynamicNavbar: true
        });
    }
};


// Let's go!
app.initialize();
