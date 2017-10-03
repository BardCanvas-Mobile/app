
var Toolbox = {
    
    loadPage: function(templateFileName, view, params, callback) {
        var languageFileName = sprintf('%s.%s.json', templateFileName, bcapp.language.iso);
        $.getJSON(languageFileName, function(pageLanguage) {
            params.context = pageLanguage;
            $.get(templateFileName, function(sourceHTML) {
                params.template = Template7.compile(sourceHTML);
                view.router.load(params);
                
                if( typeof callback === 'function' ) callback();
            });
        });
    },
    
    scanQRcode: function( targetSelector, type ) {
        
        var $target = $(targetSelector);
        var params  = {
            preferFrontCamera:     false,                           // iOS and Android
            showFlipCameraButton:  true,                            // iOS and Android
            showTorchButton:       true,                            // iOS and Android
            torchOn:               true,                            // Android, launch with the torch switched on (if available)
            saveHistory:           true,                            // Android, save scan history (default false)
            prompt:                bcapp.language.qrScanner.prompt, // Android
            resultDisplayDuration: 500,                             // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats:               "QR_CODE",                       // default: all but PDF_417 and RSS_EXPANDED
            orientation:           "portrait",                      // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations:     false,                           // iOS
            disableSuccessBeep:    false                            // iOS and Android
        };
        
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if( result.cancelled ) return;
                
                if( ! bcapp.toolbox.__validateQRcode(result.text, type) ) {
                    bcapp.framework.alert(
                        bcapp.language.qrScanner.invalidResult
                    );
                    
                    return;
                }
    
                $target.focus().val( result.text );
            },
            function (error) {
                bcapp.framework.alert(
                    sprintf(bcapp.language.qrScanner.scanFailed.message, error),
                    bcapp.language.qrScanner.scanFailed.title
                );
            },
            params
        );
    },
    
    __validateQRcode: function(value, type) {
        if( type !== 'url' ) return false;
        
        res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/);
        return res !== null;
    }
};
