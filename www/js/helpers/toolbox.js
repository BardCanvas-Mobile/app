
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
        
        res = value.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_+.~#?&=]*)/);
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
    
    /**
     * @deprecated
     */
    showNetworkActivityIndicator: function()
    {
        // if( device.platform === 'browser') return;
        //
        // if( BCapp.os === 'ios' )
        //     NetworkActivityIndicator.show();
    },
    
    /**
     * @deprecated
     */
    hideNetworkActivityIndicator: function()
    {
        // if( typeof device === 'undefined' ) return;
        // if( device.platform === 'browser') return;
        //
        // if( BCapp.os === 'ios' )
        //     NetworkActivityIndicator.hide();
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
    
        $form.find('textarea.tinymce').each(function()
        {
            var id      = $(this).attr('id');
            var editor  = tinymce.get(id);
            var content = editor.getContent();
            $(this).val( content );
        });
        
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
        if( ! silent ) BCtoolbox.addNotification( responseText.replace(/^OK:?/, '') );
        
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
            if( source.title || source.src )
            {
                source = [{
                    caption: source.title,
                    url:     source.src
                }];
            }
        }
        
        console.log(source);
        
        var browser = BCapp.framework.photoBrowser({
            photos:       source,
            theme:        'dark',
            type:         'standalone',
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
    },
    
    convertRemoteDate: function(dateString, serverTimezoneOffsetString)
    {
        var parts     = dateString.split(' ');
        var formatted = parts[0] + 'T' + parts[1];
        if( serverTimezoneOffsetString.length == 4 )
            formatted = formatted 
                      + serverTimezoneOffsetString.substring(0, 2) + ":" + serverTimezoneOffsetString.substring(2);
        else
            formatted = formatted
                      + serverTimezoneOffsetString.substring(0, 3) + ":" + serverTimezoneOffsetString.substring(3);
        
        return new Date(formatted);
    },
    
    ajaxifyForms: function( $container )
    {
        var $forms = $container.find('form');
        if( $forms.length === 0 ) return;
        
        $forms.each(function()
        {
            var $form = $(this);
            console.log('Binding ajax form ', $form.attr('id'));
            
            var targetId = $form.attr('id') + '_target';
            var options  = {
                target:          '#' + targetId,
                beforeSerialize: BCtoolbox.ajaxform_beforeSerialize,
                beforeSubmit:    BCtoolbox.ajaxform_beforeSubmit,
                beforeSend:      function(xhr, options)
                                 {
                                     BCtoolbox.ajaxform_beforeSend(xhr, options, $form);
                                 },
                uploadProgress:  function(event, position, total, percentComplete)
                                 {
                                     BCtoolbox.ajaxform_uploadProgress(
                                         event, position, total, percentComplete, $form
                                     );
                                 },
                success:         BCtoolbox.ajaxform_success,
                error:           function(xhr, textStatus, errorThrown)
                                 {
                                     BCtoolbox.ajaxform_fail(xhr, textStatus, errorThrown, $form);
                                 }
            };
            
            if( $('#' + targetId).length === 0 )
                $('body').append(sprintf('<div id="%s" style="display: none"></div>', targetId));
            
            $form.ajaxForm(options);
        });
    },
    
    /**
     * @param {{BCwebsiteClass}} website
     * 
     * @returns {object}
     */
    getTinyMCEconfiguration: function(website)
    {
        var defaults = {
            browser_spellcheck:       true,
            menubar:                  false,
            statusbar:                false,
            relative_urls:            false,
            remove_script_host:       false,
            convert_urls:             false,
            selector:                 'NOT-USED-HERE',
            plugins:                  'placeholder advlist autolink lists link anchor searchreplace paste ' +
                                      'textcolor fullscreen autoresize image imagetools hr table',
            toolbar:                  'bold italic underline strikethrough | forecolor backcolor | fontsizeselect removeformat | ' +
                                      'blockquote outdent indent | hr link unlink | fullscreen',
            imagetools_toolbar:       'imageoptions',
            paste_data_images:        true,
            fontsize_formats:         '10pt 12pt 14pt 18pt 24pt 36pt',
            content_css:              '',
            content_style:            'body {overflow-y: hidden !important;}',
            autoresize_bottom_margin: 0,
            autoresize_min_height:    100,
            autoresize_max_height:    300,
            entity_encoding:          'raw',
            formats : {
                alignleft:   {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'alignleft'},
                aligncenter: {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'aligncenter'},
                alignright:  {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'alignright'}
            }
        };
        
        if( website.meta !== null )
            if( website.meta.user_level >= BCuserLevels.Editor )
                defaults.extended_valid_elements = 'script[type|src|async],iframe[src|style|width|height|scrolling|' +
                                                   'marginwidth|marginheight|frameborder]';
        
        if( BClanguage.iso != "en_US" )
        {
            defaults.language     = BClanguage.iso;
            defaults.language_url = '/lib/tinymce/langs/' + BClanguage.iso + '.js';
        }
        
        return defaults;
    }
};
