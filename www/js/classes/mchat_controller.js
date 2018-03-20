
var BCmchatController = {
    
    /**
     * Index by chat root selector
     * 
     * @type {int}[]
     */
    usersIndexAutoreloadIntervals: {},
    
    /**
     * Index by chat root selector
     * 
     * @type {bool}[]
     */
    usersIndexAutoreloadWorkersRunning: {},
    
    usersIndexAutoreloadHeartbit: 15000,
    
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
    
    openChatUsersIndex: function(conversationId)
    {
        var $conversation = $('#' + conversationId);
        var rootSelector  = '#' + $conversation.closest('.mchat-root').attr('id');
        var $root         = $(rootSelector);
        
        $root.find('.view.chats-root').hide('slide', {direction: 'right'}, 100);
        $root.find('.view.users-list').show('slide', {direction: 'left'},  100);
    },
    
    closeChat: function(conversationId)
    {
        var $conversation = $('#' + conversationId);
        var $chatPage     = $conversation.closest('.mchat-conversation');
        var chatId        = $chatPage.attr('id');
        var chat          = $chatPage.data('mchat');
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
        
        if( BCmchatController.usersIndexAutoreloadIntervals[rootSelector] )
        {
            console.log('%cClearing refresh interval for chat index %s', 'color: green', rootSelector);
            clearInterval( BCmchatController.usersIndexAutoreloadIntervals[rootSelector] );
        }
        
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
        if( typeof BCmchatController.usersIndexAutoreloadWorkersRunning[chatRootSelector] === 'undefined' )
            BCmchatController.usersIndexAutoreloadWorkersRunning[chatRootSelector] = false;
        
        if( BCmchatController.usersIndexAutoreloadWorkersRunning[chatRootSelector] )
            return;
    
        BCmchatController.usersIndexAutoreloadWorkersRunning[chatRootSelector] = true;
        
        var $target = $(chatRootSelector).find('.users-list .page-content');
        var url     = $(chatRootSelector).attr('data-conversations-list-script-url');
        var token   = $(chatRootSelector).attr('data-token');
        
        var params  = {
            bcm_access_token: token,
            bcm_platform:     BCapp.os,
            bcm_version:      BCapp.version,
            wasuuup:          BCtoolbox.wasuuup()
        };
        
        $target.load(url, params, function()
        {
            BCmchatController.usersIndexAutoreloadWorkersRunning[chatRootSelector] = false;
            
            var unreadCount = 0;
            $(chatRootSelector).find('li[data-unread-count]').each(function()
            {
                var unreadHere = parseInt($(this).attr('data-unread-count'));
                if( unreadHere > 0 ) unreadCount++;
            });
            
            var $badge = $(chatRootSelector).closest('.website-main-view').find('.toolbar .tab-link[href*="mobile_chat"] .icon-container .badge');
            if( $badge.length > 0 )
            {
                if( unreadCount === 0 ) $badge.hide();
                else                    $badge.text(unreadCount).show();
            }
            
            if( typeof callback === 'function') callback();
        });
        
        if( typeof BCmchatController.usersIndexAutoreloadIntervals[chatRootSelector] === 'undefined' )
        {
            BCmchatController.usersIndexAutoreloadIntervals[chatRootSelector] = setInterval(
                function() { BCmchatController.reloadChatUsersIndex(chatRootSelector, null); },
                BCmchatController.usersIndexAutoreloadHeartbit
            );
            console.log('%cRefresh interval set for chat index %s', 'color: green', chatRootSelector);
        }
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
            window.resolveLocalFileSystemURL(fileURI,
                /**
                 * @param {FileEntry} fileEntry
                 */
                function(fileEntry)
                {
                    /**
                     * @param {File} file
                     */
                    fileEntry.file(function(file)
                    {
                        console.log('Got file: ', JSON.stringify(fileEntry), JSON.stringify(file));
    
                        var fname = file.name.replace(/[;"']/g, '');
                        if( fname.indexOf('?') > 0 ) fname = fname.substr(0, fname.indexOf('?'));
    
                        var ext = "";
                        if( file.type !== null )
                        {
                            ext = file.type.split("/").pop().toLowerCase();
                        }
                        else
                        {
                            if( fname.indexOf('.') > 0 )
                            {
                                ext = fname.split('.').pop().toLowerCase();
                            }
                            else
                            {
                                BCapp.framework.alert(
                                    sprintf(BClanguage.cannotDetectFileType, fileEntry.name, 'Cannot extract file extension')
                                );
                                console.log('Cannot detect extension of file: %s', fileEntry.name);
                                
                                return;
                            }
                        }
                        
                        var type    = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
                        var thumb   = fileURI;
                        var token   = website.accessToken === '' ? 'guest-' + BCtoolbox.wasuuup() : website.accessToken;
                        var mime    = sprintf('%s/%s', type, ext);
                        var tmpName = sprintf('%s-%s-%s.%s', token, BCtoolbox.wasuuup(), fname, ext);
                        var specs   = sprintf('%s;%s;%s;%s', type, tmpName, mime, tmpName);
                        
                        BCmchatController.__uploadPhotoObject(
                            fileURI, tmpName, thumb, specs, chat, website, service, manifest
                        );
                    },
                    
                    /**
                     * @param {FileError} error
                     */
                    function(error)
                    {
                        BCapp.framework.alert(
                            sprintf(BClanguage.cannotDetectFileType, fileEntry.name, BClanguage.fileErrors[error.code])
                        );
                    });
                },
                
                /**
                 * @param {FileError} error
                 */
                function(error)
                {
                    BCapp.framework.alert( sprintf(BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]) );
                }
            );
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
            
            var fname = tmpName;
            var ext   = fname.split('.').pop().toLowerCase();
            var type  = ext.match(/jpg|jpeg|png|gif/) ? 'image' : 'video';
            
            var options         = new FileUploadOptions();
            options.fileKey     = "image";
            options.fileName    = fname;
            options.mimeType    = sprintf('%s/%s', type, ext);
            options.chunkedMode = false;
            
            options.params = {
                target_name:      tmpName,
                bcm_platform:     BCapp.os,
                bcm_version:      BCapp.version,
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
    },
    
    triggerClose: function(conversationId)
    {
        BCmchatController.closeChat(conversationId);
        
        var $conversation = $('#' + conversationId);
        var rootSelector  = '#' + $conversation.closest('.mchat-root').attr('id');
        
        BCmchatController.reloadChatUsersIndex(rootSelector, null);
        BCmchatController.openChatUsersIndex(conversationId);
    },
    
    triggerUserBlock: function(conversationId)
    {
        BCapp.framework.confirm(BClanguage.chatPrompts.userBlock, function()
        {
            BCmchatController.__execRemoteAction('add_to_blocklist', conversationId);
        });
    },
    
    triggerDelete: function(conversationId)
    {
        BCapp.framework.confirm(BClanguage.chatPrompts.delete, function()
        {
            BCmchatController.__execRemoteAction('delete', conversationId);
        });
    },
    
    triggerArchive: function(conversationId)
    {
        BCapp.framework.confirm(BClanguage.chatPrompts.archive, function()
        {
            BCmchatController.__execRemoteAction('archive', conversationId);
        });
    },
    
    /**
     * @param {string} action
     * @param {string} conversationId
     * @private
     */
    __execRemoteAction: function(action, conversationId)
    {
        var $chatPage    = $('#' + conversationId);
        var chat         = $chatPage.data('mchat');
        var $root        = $(chat.config.chatRootSelector);
        var $servicePage = $root.closest('.service-container');
        var service      = $servicePage.data('service');
        var website      = $servicePage.data('website');
        
        var url    = chat.config.workerURL;
        var params = {
            action:        action,
            other_user_id: chat.config.userId,
            wasuuup:       BCtoolbox.wasuuup()
        };
        BCtoolbox.showFullPageLoader();
        console.log('Fetching %s...', url);
        chat.pause();
        $.get(url, params, function(response)
        {
            if( response !== 'OK' )
            {
                console.log('Invalid response: %s', response);
                BCtoolbox.hideFullPageLoader();
                
                BCapp.framework.alert(
                    sprintf(BClanguage.chatActionErrors[action], response),
                    BClanguage.chatActionErrors.title,
                    function() { chat.resume(); }
                );
                
                return;
            }
            
            BCtoolbox.hideFullPageLoader();
            console.log('Done.');
            BCmchatController.triggerClose(conversationId);
            BCmchatController.reloadChatUsersIndex(chat.config.chatRootSelector);
        })
        .fail(function($xhr, status, error)
        {
            console.log('AJAX error: %s', error);
            BCtoolbox.hideFullPageLoader();
            
            BCapp.framework.alert(
                sprintf(BClanguage.chatActionErrors[action], error),
                BClanguage.chatActionErrors.title,
                function() { chat.resume(); }
            );
        });
    }
};
