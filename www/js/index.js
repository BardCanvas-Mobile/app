
// Global helpers
var f7 = new Framework7();
var $$ = Dom7;

window.bcapp = {
    
    framework: f7,
    
    settings: GlobalSettings,
    
    toolbox: Toolbox,
    
    eventHandlers: EventHandlers,
    
    networkType:      navigator.connection.type,
    networkConnected: true,
    
    batteryIsLow: false,
    
    /**
     * @var {View}
     */
    mainView: null,
    
    init: function() {
        bcapp.__adjustOrientation();
        $(window).resize(function() { bcapp.__adjustOrientation(); });
        
        bcapp.eventHandlers.init();
        bcapp.__initMainView();
    },
    
    __adjustOrientation: function() {
        var orientation = $(window).width() <= $(window).height() ? 'portrait' : 'landscape';
        $('body').attr('data-orientation', orientation);
    },
    
    __initMainView: function() {
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
        
        var file = sprintf('templates/%s/main-view.html', os);
        bcapp.mainView.router.load({
            url:    file,
            reload: true
        });
    }
};

bcapp.init();
