
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
        
        var view = BCapp.currentNestedView ? BCapp.currentNestedView : BCapp.currentView;
        console.log('Back button pressed. Current view: %s', view.selector);
        
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
        
        if( view.selector.indexOf('mobile_chat') >= 0 )
        {
            console.log('Back button pressed on a chat view.');
            var $conversation = $(view.selector).find('.page.mchat-conversation:visible'); 
            if( $conversation.length > 0 )
            {
                console.log('Back button: closing visible chat.');
                $conversation.find('.chat-closing-trigger').click();
                
                return;
            }
        }
        
        if( typeof view.activePage === 'undefined' )
        {
            console.log('Back button: current page not defined - falling back to shell control.');
        }
        else
        {
            var pageName = view.activePage.name;
            console.log('Back button: current page name: %s (not an index)', pageName);
            if( pageName.indexOf('-index') < 0 )
            {
                BCapp.framework.hidePreloader();
                view.router.back();
                
                return;
            }
        }
        
        navigator.Backbutton.goBack(function() {
            BCapp.framework.hidePreloader();
            console.log('SLEEPING APP - Going to previous app.')
        }, function() {
            navigator.Backbutton.goHome(function() {
                BCapp.framework.hidePreloader();
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
