var EventHandlers = {
    
    init: function() {
        document.addEventListener('batterystatus', EventHandlers.__batteryStatusChange, false);
        document.addEventListener('offline', EventHandlers.__networkDisconnected, false);
        document.addEventListener('online', EventHandlers.__networkConnected, false);
        
        document.addEventListener('backbutton', EventHandlers.__backButtonPressed, false);
        
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
