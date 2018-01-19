
var BCmchatController = {
    
    openChat: function(trigger)
    {
        var $trigger     = $(trigger);
        var rootSelector = '#' + $trigger.closest('.mchat-root').attr('id');
        var $root        = $(rootSelector);
        var workerURL    = $root.attr('data-worker-url');
        var idAccount    = $trigger.attr('data-id-account');
        var displayName  = $trigger.attr('data-display-name');
        var avatar       = $trigger.attr('data-avatar');
        var pageId       = $trigger.attr('rel');
        var $page        = $('#' + pageId);
        
        if( $page.length > 0 )
        {
            $root.find('.view.users-list').hide('slide', {direction: 'left'},  100);
            $root.find('.view.chats-root').show('slide', {direction: 'right'}, 100);
            $page.data('mchat').show();
            
            return;
        }
        
        $root.find('.view.users-list').hide('slide', {direction: 'left'},  100);
        $root.find('.view.chats-root').show('slide', {direction: 'right'}, 100);
        var x = new mchat(
            rootSelector,
            pageId,
            idAccount,
            displayName,
            avatar,
            workerURL
        );
    },
    
    openChatUsersIndex: function(trigger)
    {
        var $trigger     = $(trigger);
        var rootSelector = '#' + $trigger.closest('.mchat-root').attr('id');
        var $root        = $(rootSelector);
        
        $root.find('.view.chats-root').hide('slide', {direction: 'right'}, 100);
        $root.find('.view.users-list').show('slide', {direction: 'left'},  100);
    },
    
    closeChat: function(trigger)
    {
        var $trigger  = $(trigger);
        var $chatPage = $trigger.closest('.mchat-conversation');
        var chatId    = $chatPage.attr('id');
        var chat      = $chatPage.data('mchat');
        if( chat )
        {
            if( chat.interval ) clearInterval(chat.interval);
            if( chat.xhr ) chat.xhr.abort();
            
            var $root   = $(chat.config.chatRootSelector);
            var itemSel = sprintf('.users-list .user-trigger[data-id-account="%s"]', chat.config.userId);
            $root.find(itemSel).toggleClass('selected', false);
            
            console.log('%c>>> Chat #%s closed.', 'color: green', chatId);
            setTimeout(function() { $chatPage.remove(); }, 200);
        }
    },
    
    closeAllChats: function(trigger)
    {
        var $trigger     = $(trigger);
        var rootSelector = '#' + $trigger.closest('.mchat-root').attr('id');
        var $root        = $(rootSelector);
        
        $root.find('.mchat-conversation').each(function()
        {
            var $this  = $(this);
            var chatId = $this.attr('id');
            var chat   = $this.data('mchat');
            if( chat )
            {
                if( chat.interval ) clearInterval(chat.interval);
                if( chat.xhr ) chat.xhr.abort();
                console.log('%c>>> Chat #%s closed.', 'color: green', chatId);
            }
        });
    },
    
    reloadChatUsersIndex: function(chatRootSelector, callback)
    {
        var $target = $(chatRootSelector).find('.users-list .page-content');
        var url     = $(chatRootSelector).attr('data-conversations-list-script-url');
        var token   = $(chatRootSelector).attr('data-token');
        
        var params  = {
            bcm_access_token: token,
            bcm_platform:     BCapp.os,
            wasuuup:          BCtoolbox.wasuuup()
        };
        
        $target.load(url, params, function()
        {
            if( typeof callback !== 'undefined') callback();
        });
    },
    
    /**
     * @param {object} trigger
     */
    getPhotoFromLibrary: function(trigger)
    {
        var $trigger  = $(trigger);
        var $chatPage = $trigger.closest('.mchat-conversation');
        var chatId    = $chatPage.attr('id');
        var chat      = $chatPage.data('mchat');
        var $root        = $(chat.config.chatRootSelector);
        var $servicePage = $root.closest('.service-container');
        var service      = $servicePage.data('service');
        var website      = $servicePage.data('website');
        var manifest     = $servicePage.data('manifest');
        
        var success = function( fileURI )
        {
            if( fileURI.indexOf('file://') < 0 ) fileURI = 'file://' + fileURI;
            console.log('Got file URI: ', fileURI);
            
            var fname   = fileURI.split('/').pop().replace(/[;"']/g, '');
            if( fname.indexOf('?') > 0 ) fname = fname.substr(0, fname.indexOf('?'));
            
            if( fname.indexOf('.') < 0 )
            {
                BCapp.framework.alert(BClanguage.cannotDetectFileType);
                
                return;
            }
            
            var ext     = fname.split('.').pop().toLowerCase();
            var type    = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
            var thumb   = fileURI;
            var token   = website.accessToken === '' ? 'guest-' + BCtoolbox.wasuuup() : website.accessToken;
            var mime    = sprintf('%s/%s', type, ext);
            var tmpName = sprintf('%s-%s-%s', token, BCtoolbox.wasuuup(), fname);
            var specs   = sprintf('%s;%s;%s;%s', type, fname, mime, tmpName);
            
            BCmchatController.__uploadPhotoObject(fileURI, tmpName, thumb, specs, chat, website, service, manifest);
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
            mediaType:       navigator.camera.MediaType.PICTURE
        };
        
        navigator.camera.getPicture(success, fail, options);
    },
    
    /**
     * @param {string}                       fileURI
     * @param {string}                       tmpName
     * @param {string}                       thumb
     * @param {string}                       specs
     * @param {mchat}                        chat
     * @param {BCwebsiteClass}               website
     * @param {BCwebsiteServiceDetailsClass} service
     * @param {BCwebsiteManifestClass}       manifest
     * 
     * @private
     */
    __uploadPhotoObject: function(fileURI, tmpName, thumb, specs, chat, website, service, manifest)
    {
        var SERVER = chat.config.workerURL;
        var $item  = $(this);
        
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
                BCtoolbox.hideFullPageLoader();
                console.log("Successful upload. response: " + r.response);
                
                if(r.response !== 'OK')
                    BCtoolbox.addNotification(
                        sprintf(BClanguage.photoUploader.message, r.response)
                    );
            };
            
            /**
             * @param {FileTransferError} error
             */
            var fail = function (error)
            {
                BCtoolbox.hideFullPageLoader();
                
                BCtoolbox.addNotification(
                    sprintf(BClanguage.photoUploader.message, BClanguage.fileTransferErrors[error.code])
                );
            };
            
            var fname = fileURL.substr(fileURL.lastIndexOf('/') + 1);
            var ext   = fname.split('.').pop().toLowerCase();
            var type  = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
            
            var options      = new FileUploadOptions();
            options.fileKey  = "image";
            options.fileName = fname;
            options.mimeType = sprintf('%s/%s', type, ext);
            options.params   = {
                target_name:      tmpName,
                bcm_platform:     BCapp.os,
                bcm_access_token: website.accessToken,
                send_message:     '@!image',
                other_user_id:    chat.config.userId,
                wasuuup:          BCtoolbox.wasuuup()
            };
            
            var ft = new FileTransfer();
            
            /**
             * @param {ProgressEvent} progressEvent
             */
            ft.onprogress = function(progressEvent)
            {
                if( progressEvent.lengthComputable )
                {
                    var total  = progressEvent.total;
                    var loaded = progressEvent.loaded;
                    var pct    = loaded / total;
                    var val    = 0;
                    // $item.find('.progress-bar').circleProgress('value', pct);
                    
                    if( total > 1000000 ) val = (loaded / 1000000).toFixed(1) + 'm';
                    else if(total > 1000) val = (loaded / 1000).toFixed(1) + 'k';
                    // $item.find('.progress-icon').text(val);
                }
            };
            
            BCtoolbox.showFullPageLoader();
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
        };
        
        window.resolveLocalFileSystemURL(fileURI, success, fail);
    }
};
