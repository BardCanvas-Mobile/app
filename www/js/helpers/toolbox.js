
var BCtoolbox = {
    
    scanQRcode: function( targetSelector, type ) {
        
        var $target = $(targetSelector);
        var params  = {
            preferFrontCamera:     false,                           // iOS and Android
            showFlipCameraButton:  true,                            // iOS and Android
            showTorchButton:       true,                            // iOS and Android
            torchOn:               true,                            // Android, launch with the torch switched on (if available)
            saveHistory:           true,                            // Android, save scan history (default false)
            prompt:                BCapp.language.qrScanner.prompt, // Android
            resultDisplayDuration: 500,                             // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats:               "QR_CODE",                       // default: all but PDF_417 and RSS_EXPANDED
            orientation:           "portrait",                      // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations:     false,                           // iOS
            disableSuccessBeep:    false                            // iOS and Android
        };
        
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if( result.cancelled ) return;
                
                if( ! BCtoolbox.__validateQRcode(result.text, type) ) {
                    BCapp.framework.alert(
                        BCapp.language.qrScanner.invalidResult
                    );
                    
                    return;
                }
    
                $target.focus().val( result.text );
            },
            function (error) {
                BCapp.framework.alert(
                    sprintf(BCapp.language.qrScanner.scanFailed.message, error),
                    BCapp.language.qrScanner.scanFailed.title
                );
            },
            params
        );
    },
    
    __validateQRcode: function(value, type) {
        if( type !== 'url' ) return false;
        
        res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/);
        return res !== null;
    },
    
    /**
     * @returns {jQuery}
     */
    getCurrentPageContentArea: function() {
        var view = BCapp.currentView;
        var page = view.activePage;
        
        return $(page.container).find('.page-content');
    },
    
    getFileStorageDirectory: function(targetDirectory) {
        var dir = '';
        
        if( BCapp.settings.os === 'ios' )
            dir = cordova.file.dataDirectory;
        else if( BCapp.settings.storage === 'local' )
            dir = cordova.file.dataDirectory;
        else
            dir = cordova.file.externalDataDirectory;
        
        dir = dir + targetDirectory;
        
        return dir;
    },
    
    isValidURL: function(url) {
        var regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
        var reg        = new RegExp(regexQuery, "i");
        
        return reg.test(url);
    }
};
