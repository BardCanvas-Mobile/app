
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
        BCtoolbox.showFullPageLoader();
        
        // Item data-uploading-status flags: none, uploading, uploaded
        var all       = $form.find('.photos .bc-image-item').length;
        var none      = $form.find('.photos .bc-image-item[data-uploading-status="none"]').length;
        var uploading = $form.find('.photos .bc-image-item[data-uploading-status="uploading"]').length;
        console.log('Media items to process ~ all:%s none:%s uploading:%s', all, none, uploading);
        
        if( all > 0 )
        {
            if( none === all )
            {
                console.log('Starting upload of %s items in the background.', all);
                BCtoolbox.__uploadPhotoObjects($form);
                setTimeout(function() { $form.submit(); }, 5000);
                
                return false;
            }
            
            if( uploading > 0 )
            {
                console.log('Still waiting for %s items to upload.', uploading);
                BCtoolbox.hideFullPageLoader();
                BCtoolbox.addNotification(BClanguage.photoUploader.working);
                
                return false;
            }
        }
        
        if( $form.attr('beforesubmit') ) eval( $form.attr('beforesubmit') );
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
     * @param {object} trigger
     * @param {bool}   includeVideos
     */
    getPhotoFromLibrary: function(trigger, includeVideos)
    {
        var $container = $(trigger).closest('.bc-image-uploader');
        var $form      = $('#local_composed_form');
        var website    = $form.data('website');
        var $target    = $container.find('.photos');
        
        var success = function( fileURI )
        {
            if( fileURI.indexOf('file://') < 0 ) fileURI = 'file://' + fileURI;
            console.log('Got file URI: ', fileURI);
            
            var fname   = fileURI.split('/').pop().replace(/[;"']/g, '');
            var ext     = fname.split('.').pop().toLowerCase();
            var type    = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
            var thumb   = type === 'image' ? fileURI : 'media/Video-300.png';
            var token   = website.accessToken === '' ? 'guest-' + BCtoolbox.wasuuup() : website.accessToken;
            var mime    = sprintf('%s/%s', type, ext);
            var tmpName = sprintf('%s-%s-%s', token, BCtoolbox.wasuuup(), fname);
            var specs   = sprintf('%s;%s;%s;%s', type, fname, mime, tmpName);
            var html    = '<div class="bc-image-item" data-uri="%s" data-tmp-name="%s" data-uploading-status="none">' +
                          '<img src="%s">' +
                          '<input type="hidden" name="embedded_attachments[]" value="%s">' +
                          '</div>';
            $target.append(sprintf(html, fileURI, tmpName, thumb, specs));
            console.log('Successfully added embedded attachment with specs ', specs);
        };
        
        var fail = function( error )
        {
            if( error.search(/cancel/i) >= 0 ) return;
            
            BCapp.framework.alert(
                sprintf(BClanguage.photoRetriever.message, error),
                BClanguage.photoRetriever.title
            );
        };
        
        var options = {
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType:      navigator.camera.PictureSourceType.PHOTOLIBRARY,
            mediaType:       includeVideos ? navigator.camera.MediaType.ALLMEDIA : navigator.camera.MediaType.PICTURE
        };
        
        navigator.camera.getPicture(success, fail, options);
    },
    
    __uploadPhotoObjects: function($form)
    {
        var $items = $form.find('.photos .bc-image-item');
        if( $items.length === 0 ) return;
        
        var website  = $form.data('website');
        var service  = $form.data('service');
        var manifest = $form.data('manifest');
        var SERVER   = manifest.rootURL + '/mobile_controller/scripts/receive_attachment.php';
        
        $items.each(function()
        {
            var $item   = $(this);
            var status  = $item.attr('data-uploading-status');
            var tmpName = $item.attr('data-tmp-name');
            if( status !== 'none' ) return;
            
            $item.attr('data-uploading-status', 'uploading');
            var fileURI = $item.attr('data-uri');
            
            /**
             * @param {FileEntry} fileEntry
             */
            var success = function (fileEntry)
            {
                console.log("Got file entry: ", fileEntry);
                
                var fileURL = fileEntry.toURL();
                
                /**
                 * @param {FileUploadResult} r
                 */
                var success = function (r)
                {
                    console.log("Successful upload. response: " + r.response);
                    
                    if(r.response !== 'OK')
                    {
                        BCtoolbox.addNotification(
                            sprintf(BClanguage.photoUploader.message, r.response)
                        );
                        
                        $item.attr('data-uploading-status', 'none');
                        
                        return;
                    }
                    
                    $item.attr('data-uploading-status', 'uploaded');
                };
                
                /**
                 * @param {FileTransferError} error
                 */
                var fail = function (error)
                {
                    BCtoolbox.addNotification(
                        sprintf(BClanguage.photoUploader.message, BClanguage.fileTransferErrors[error.code])
                    );
                    
                    $item.fadeOut('fast', function() { $(this).remove(); });
                };
                
                var fname = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                var ext   = fname.split('.').pop().toLowerCase();
                var type  = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
                
                var options      = new FileUploadOptions();
                options.fileKey  = "file";
                options.fileName = fname;
                options.mimeType = sprintf('%s/%s', type, ext);
                options.params   = {
                    target_name:      tmpName,
                    bcm_platform:     BCapp.os,
                    bcm_access_token: website.accessToken,
                    wasuuup:          BCtoolbox.wasuuup()
                };
                
                var ft = new FileTransfer();
                
                /**
                 * @param {ProgressEvent} progressEvent
                 */
                ft.onprogress = function(progressEvent)
                {
                    if (progressEvent.lengthComputable)
                        console.log('Uploaded %s of %s', progressEvent.loaded, progressEvent.total);
                    else
                        console.log('Uploading...');
                };
                
                console.log('Starting upload of %s as %s to %s...', tmpName, fname, SERVER);
                ft.upload(fileURL, encodeURI(SERVER), success, fail, options);
            };
            
            /**
             * @param {FileError} error
             */
            var fail = function(error)
            {
                BCtoolbox.addNotification(
                    sprintf(BClanguage.photoRetriever.message, BClanguage.fileErrors[error.code])
                );
                
                $item.fadeOut('fast', function() { $(this).remove(); });
            };
            
            window.resolveLocalFileSystemURL(fileURI, success, fail);
        });
    },
    
    /**
     * Array Buffer to Base64 string converter
     * Copyright 2011 Jon Leighton
     * @see   https://gist.github.com/jonleighton/958841
     * 
     * @param {Array} arrayBuffer
     * 
     * @returns {string}
     */
    base64ArrayBuffer: function(arrayBuffer)
    {
        var base64    = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        
        var bytes         = new Uint8Array(arrayBuffer);
        var byteLength    = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength    = byteLength - byteRemainder;
        
        var a, b, c, d;
        var chunk;
        
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3)
        {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1
            
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }
        
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1)
        {
            chunk = bytes[mainLength];
            
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
            
            // Set the 4 least significant bits to zero
            b = (chunk & 3)   << 4; // 3   = 2^2 - 1
            
            base64 += encodings[a] + encodings[b] + '=='
        }
        else if (byteRemainder == 2)
        {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
            
            // Set the 2 least significant bits to zero
            c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
            
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        
        return base64;
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
        var defaults = BCtinyMCEdefaults;
        
        if( website.meta !== null )
            if( website.meta.user_level >= BCuserLevels.Editor )
                defaults.extended_valid_elements = 'script[type|src|async],iframe[src|style|width|height|scrolling|' +
                                                   'marginwidth|marginheight|frameborder]';
        
        if( BClanguage.iso != "en_US" )
        {
            defaults.language     = BClanguage.iso;
            defaults.language_url = 'lib/tinymce/langs/' + BClanguage.iso + '.js';
        }
        
        // Note: full screen doesn't fit well with navbars/toolbars.
        // var prefix = defaults.toolbar.search(/\|$/) < 0 ? ' |' : '';
        // defaults.toolbar = defaults.toolbar + prefix + ' fullscreen';
        
        return defaults;
    },
    
    /**
     * @param {object} trigger
     * 
     * @see https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
     */
    share: function( trigger )
    {
        var $trigger     = $(trigger);
        var url          = $trigger.attr('data-url');
        var websiteName  = $('<div/>').text($trigger.attr('data-website-name')).html();
        var webShortName = $('<div/>').text($trigger.attr('data-webshort-name')).html();
        var itemTitle    = $('<div/>').text($trigger.attr('title')).html();
        console.log('%cInvoked social sharing plugin for %s', 'color: fucsia', url);
        
        var options = {
            message:      sprintf('%s: %s', webShortName, itemTitle),
            subject:      sprintf('%s: %s', webShortName, itemTitle),
            url:          url,
            chooserTitle: BClanguage.sharing.title
        };
        
        window.plugins.socialsharing.shareWithOptions(
            options,
            function(result)
            {
                console.log('URL "%s" successfully sent to %s', url, result.app)
            },
            function(msg)
            {
                BCapp.framework.alert(sprintf(BClanguage.sharing.error, msg), webShortName);
            }
        );
    }
};
