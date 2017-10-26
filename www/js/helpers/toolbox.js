
var BCtoolbox = {
    
    scanQRcode: function( targetSelector, type )
    {
        var $target = $(targetSelector);
        var params  = {
            preferFrontCamera:     false,                       // iOS and Android
            showFlipCameraButton:  true,                        // iOS and Android
            showTorchButton:       true,                        // iOS and Android
            torchOn:               true,                        // Android, launch with the torch switched on (if available)
            saveHistory:           true,                        // Android, save scan history (default false)
            prompt:                BClanguage.qrScanner.prompt, // Android
            resultDisplayDuration: 500,                         // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats:               "QR_CODE",                   // default: all but PDF_417 and RSS_EXPANDED
            orientation:           "portrait",                  // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations:     false,                       // iOS
            disableSuccessBeep:    false                        // iOS and Android
        };
        
        cordova.plugins.barcodeScanner.scan(
            function (result)
            {
                if( result.cancelled ) return;
                
                if( ! BCtoolbox.__validateQRcode(result.text, type) )
                {
                    BCapp.framework.alert(
                        BClanguage.qrScanner.invalidResult
                    );
                    
                    return;
                }
                
                $target.focus().val( result.text );
            },
            function (error)
            {
                BCapp.framework.alert(
                    sprintf(BClanguage.qrScanner.scanFailed.message, error),
                    BClanguage.qrScanner.scanFailed.title
                );
            },
            params
        );
    },
    
    /**
     * @param value
     * @param type
     * @returns {boolean}
     * @private
     */
    __validateQRcode: function(value, type)
    {
        if( type !== 'url' ) return false;
        
        res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/);
        return res !== null;
    },
    
    /**
     * @returns {jQuery}
     */
    getCurrentPageContentArea: function()
    {
        var view = BCapp.currentView;
        var page = view.activePage;
        
        return $(page.container).find('.page-content');
    },
    
    isValidURL: function(url)
    {
        var regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
        var reg        = new RegExp(regexQuery, "i");
        
        return reg.test(url);
    },
    
    showNetworkActivityIndicator: function()
    {
        if( device.platform === 'browser') return;
        
        if( BCapp.os === 'ios' )
            NetworkActivityIndicator.show();
    },
    
    hideNetworkActivityIndicator: function()
    {
        if( device.platform === 'browser') return;
        
        if( BCapp.os === 'ios' )
            NetworkActivityIndicator.hide();
    },
    
    wasuuup: function()
    {
        return CryptoJS.MD5('' + (Math.random() * 1000000000000000)).toString();
    },
    
    removeFromCollection: function(needle, haystack)
    {
        var newHaystack = [];
        
        for(var i in haystack)
            if( i !== needle )
                newHaystack[i] = haystack[i];
        
        return newHaystack;
    },
    
    showFullPageLoader: function()
    {
        BCapp.framework.showIndicator();
        BCtoolbox.showNetworkActivityIndicator();
    },
    
    hideFullPageLoader: function()
    {
        BCapp.framework.hideIndicator();
        BCtoolbox.hideNetworkActivityIndicator();
    },
    
    ajaxform_beforeSerialize: function($form, options)
    {
        if( $form.attr('beforeserialize') ) eval( $form.attr('beforeserialize') );
    },
    
    ajaxform_beforeSend: function(xhr, options, $form)
    {
        console.log('•> Before send internally triggered on ', $form.attr('id'));
    },
    
    ajaxform_beforeSubmit: function(formData, $form, options)
    {
        if( $form.attr('beforesubmit') ) eval( $form.attr('beforesubmit') );
        
        BCtoolbox.showFullPageLoader();
    },
    
    ajaxform_uploadProgress: function(event, position, total, percentComplete, $form)
    {
        console.log(sprintf('•> Submitted %s/%s (%s%%) on ', position, total, percentComplete), $form.attr('id'));
    },
    
    ajaxform_success: function(responseText, statusText, xhr, $form)
    {
        BCtoolbox.hideFullPageLoader();
        
        if( responseText.indexOf('OK') < 0 )
        {
            BCapp.framework.alert(responseText);
            
            return;
        }
        
        var options = {};
        options.message = responseText.replace(/^OK:/, '');
        if( BCapp.os === 'ios')
        {
            options.title = $form.closest('.service-page').attr('data-service-title');
            options.media = sprintf('<img src="%s">', $form.closest('.service-page').attr('data-website-icon'));
        }
        
        BCapp.framework.addNotification(options);
        
        if( $form.attr('onsuccess') ) eval( $form.attr('onsuccess') );
    },
    
    ajaxform_fail: function(xhr, textStatus, errorThrown, $form)
    {
        BCtoolbox.hideFullPageLoader();
        
        if( $form.attr('onerror') ) eval( $form.attr('onerror') );
    },
    
    toggleFramedContentState: function(trigger)
    {
        var $trigger = $(trigger);
        if( $trigger.hasClass('state_active') )
            $trigger.toggleClass('state_active', false).toggleClass('state_disabled', true);
        else if( $trigger.hasClass('state_disabled') )
            $trigger.toggleClass('state_active', true).toggleClass('state_disabled', false);
    },
    
    /**
     * @param {string|Array|image} source
     */
    showPhotoBrowser: function(source)
    {
        console.log(source);
        
        if( typeof source === 'string' )
        {
            source = [ source ];
        }
        else if( typeof source === 'object' )
        {
            if( typeof source.src === 'string' )
                source = [ source.src ];
        }
        
        console.log(source);
        
        var browser = BCapp.framework.photoBrowser({
            photos: source,
            theme:  'dark',
            type:   'popup'
        });
        
        browser.open();
    }
};
