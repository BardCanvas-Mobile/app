
var BCeventHandlers = {
    
    init: function() {
        document.addEventListener('batterystatus', BCeventHandlers.__batteryStatusChange, false);
        document.addEventListener('offline',       BCeventHandlers.__networkDisconnected, false);
        document.addEventListener('online',        BCeventHandlers.__networkConnected,    false);
        document.addEventListener('backbutton',    BCeventHandlers.__backButtonPressed,   false);
    },
    
    /**
     * @param e
     * @private
     */
    __backButtonPressed: function(e) {
        e.preventDefault();
        
        if( $('#left-panel').is(':visible') ||  $('#right-panel').is(':visible') ) {
            BCapp.framework.closePanel();
            
            return;
        }
        
        var view = BCapp.currentView;
        var page = view.activePage;
        BCapp.framework.hidePreloader();
        
        if( page.name.indexOf("-index") < 0 ) {
            view.router.back();
            
            return;
        }
        
        BCapp.framework.confirm(
            BClanguage.exit.message,
            BClanguage.exit.title,
            function () {
                navigator.app.clearHistory();
                navigator.app.exitApp();
            }
        );
    },
    
    /**
     * @param status
     * @private
     */
    __batteryStatusChange: function(status) {
        BCapp.batteryIsLow = status.level < 10;
    },
    
    /**
     * @private
     */
    __networkDisconnected: function() {
        BCapp.networkType      = navigator.connection.type;
        BCapp.networkConnected = false;
    },
    
    /**
     * @private
     */
    __networkConnected: function() {
        BCapp.networkType      = navigator.connection.type;
        BCapp.networkConnected = (
            BCapp.networkType === Connection.WIFI ||
            BCapp.networkType === Connection.ETHERNET ||
            BCapp.networkType === Connection.UNKNOWN
        );
    }
};
