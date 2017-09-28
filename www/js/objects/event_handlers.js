
var EventHandlers = {
    
    init: function() {
        document.addEventListener('deviceready',      EventHandlers.__deviceReady,         false);
        document.addEventListener('backbutton',       EventHandlers.__backButtonPressed,   false);
        document.addEventListener('batterystatus',    EventHandlers.__batteryStatusChange, false);
        document.addEventListener('offline',          EventHandlers.__networkDisconnected, false);
        document.addEventListener('online',           EventHandlers.__networkConnected,    false);
    },
    
    __deviceReady: function() {
        var os = bcapp.framework.device.os;
        if( os !== 'ios' )
        {
            $$('head')
                .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">')
                .append('<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">');
        }
    },
    
    __backButtonPressed: function(e) {
        e.preventDefault();
        var page = bcapp.mainView.activePage;
        bcapp.framework.hidePreloader();
        
        if( page.name !== "main" )
        {
            bcapp.mainView.router.back();
            
            return;
        }
        
        if( confirm("Do you want to exit?") )
        {
            navigator.app.clearHistory();
            navigator.app.exitApp();
        }
    },
    
    __batteryStatusChange: function(status) {
        bcapp.batteryIsLow = status.level < 10;
    },
    
    __networkDisconnected: function() {
        bcapp.networkType      = navigator.connection.type;
        bcapp.networkConnected = false;
    },
    
    __networkConnected: function() {
        bcapp.networkType      = navigator.connection.type;
        bcapp.networkConnected = (
            bcapp.networkType === Connection.WIFI ||
            bcapp.networkType === Connection.ETHERNET ||
            bcapp.networkType === Connection.UNKNOWN
        );
    }
};
