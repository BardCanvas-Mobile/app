
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
        console.log('•> Before serialize internally triggered on ', $form.attr('id'));
        if( $form.attr('beforeserialize') ) eval( $form.attr('beforeserialize') );
    },
    
    ajaxform_beforeSend: function(xhr, options, $form)
    {
        console.log('•> Before send internally triggered on ', $form.attr('id'));
    },
    
    ajaxform_beforeSubmit: function(formData, $form, options)
    {
        console.log('•> Before submit internally triggered on ', $form.attr('id'));
        if( $form.attr('beforesubmit') ) eval( $form.attr('beforesubmit') );
        
        BCtoolbox.showFullPageLoader();
    },
    
    ajaxform_uploadProgress: function(event, position, total, percentComplete, $form)
    {
        console.log(sprintf('•> Submitted %s/%s (%s%%) on ', position, total, percentComplete), $form.attr('id'));
    },
    
    ajaxform_success: function(responseText, statusText, xhr, $form)
    {
        console.log('•> Success internally triggered on ', $form.attr('id'));
        BCtoolbox.hideFullPageLoader();
        
        if( responseText.indexOf('OK') < 0 )
        {
            BCapp.framework.alert(responseText);
            
            return;
        }
        
        var silent = $form.attr('silent');
        if(typeof silent === 'undefined') silent = 'false';
        silent = silent === 'true';
        if( ! silent ) BCtoolbox.addNotification( responseText.replace(/^OK\:?/, '') );
        
        if( $form.attr('onsuccess') ) eval( $form.attr('onsuccess') );
    },
    
    ajaxform_fail: function(xhr, textStatus, errorThrown, $form)
    {
        console.log('•> Fail internally triggered on ', $form.attr('id'));
        BCtoolbox.hideFullPageLoader();
        
        if( $form.attr('onerror') ) eval( $form.attr('onerror') );
    },
    
    addNotification: function(message)
    {
        if( message === '' ) return;
        
        var options = {};
        
        options.message = message;
        if( BCapp.os === 'ios')
        {
            var $view;
            if( BCapp.currentNestedView ) $view = $(BCapp.currentNestedView.selector);
            else                          $view = $(BCapp.currentView.selector);
        
            var $page     = $view.find('.service-page');
            options.title = $page.attr('data-service-title');
            options.media = sprintf('<img src="%s">', $page.attr('data-website-icon'));
        }
        
        BCapp.framework.addNotification(options);
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
            photos:       source,
            theme:        'dark',
            type:         'popup',
            backLinkText: BClanguage.actions.close,
            ofText:       BClanguage.of
        });
        
        browser.open();
    },
    
    /**
     * @param {string|jQuery} $container
     */
    getPhotoFromLibrary: function($container)
    {
        if( typeof $container === 'string' ) $container = $($container);
        
        var $target = $container.find('.photos');
        navigator.camera.getPicture(
            function( fileURI )
            {
                $target.append(sprintf( '<div class="bc-image-item"><img src="%s"></div>', fileURI ));
            },
            function( error )
            {
                if( error.search(/cancel/i) >= 0 ) return;
                
                BCapp.framework.alert(
                    sprintf(BClanguage.photoRetriever.message, error),
                    BClanguage.photoRetriever.title
                );
            },
            {
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType:      navigator.camera.PictureSourceType.PHOTOLIBRARY
            }
        );
    }
};
