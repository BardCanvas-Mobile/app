
var BCeventHandlers =
{
    init: function()
    {
        document.addEventListener('batterystatus', BCeventHandlers.__batteryStatusChange, false);
        document.addEventListener('offline',       BCeventHandlers.__networkDisconnected, false);
        document.addEventListener('online',        BCeventHandlers.__networkConnected,    false);
        document.addEventListener('backbutton',    BCeventHandlers.__backButtonPressed,   false);
    },
    
    /**
     * @param e
     * @private
     */
    __backButtonPressed: function(e)
    {
        e.preventDefault();
        
        if( $('#left-panel').is(':visible') || $('#right-panel').is(':visible') )
        {
            BCapp.framework.closePanel();
            
            return;
        }
        
        if( $('.popup:visible').length > 0 )
        {
            BCapp.framework.closeModal();
            
            return;
        }
        
        if( $('.popover:visible').length > 0 )
        {
            BCapp.framework.closeModal();
            
            return;
        }
        
        if( $('.photo-browser:visible').length > 0 )
        {
            BCapp.photoBrowser.close();
            
            return;
        }
        
        var view = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
        var page = view.activePage;
        BCapp.framework.hidePreloader();
        
        if( typeof page.name === 'undefined' )
        {
            console.log('Back button pressed - undefined page name.');
            if( page.name.indexOf('-index') < 0 )
            {
                view.router.back();
                
                return;
            }
        }
        
        if( page.name === '' )
        {
            console.log('Back button pressed - empty page name.');
            if( page.name.indexOf('-index') < 0 )
            {
                view.router.back();
                
                return;
            }
        }
        
        console.log('Back button pressed - current page name: %s (not an index)', page.name);
        if( page.name.indexOf('-index') < 0 )
        {
            view.router.back();
            
            return;
        }
        
        navigator.Backbutton.goBack(function() {
            console.log('SLEEPING APP - Going to previous app.')
        }, function() {
            navigator.Backbutton.goHome(function() {
                console.log('SPEEPING APP - Going to device home.')
            }, function() {
                BCapp.framework.confirm(
                    BClanguage.exit.message,
                    BClanguage.exit.title,
                    function()
                    {
                        navigator.app.clearHistory();
                        navigator.app.exitApp();
                    }
                );
            });
        });
    },
    
    /**
     * @param status
     * @private
     */
    __batteryStatusChange: function(status)
    {
        BCapp.batteryIsLow = status.level < 10;
    },
    
    /**
     * @private
     */
    __networkDisconnected: function()
    {
        BCapp.networkType      = navigator.connection.type;
        BCapp.networkConnected = false;
    },
    
    /**
     * @private
     */
    __networkConnected: function()
    {
        BCapp.networkType      = navigator.connection.type;
        BCapp.networkConnected = (
            BCapp.networkType === Connection.WIFI     ||
            BCapp.networkType === Connection.ETHERNET ||
            BCapp.networkType === Connection.UNKNOWN
        );
    }
};
