/**
 * 
 * @param {string} chatRootSelector
 * @param {string} conversationId
 * @param {int}    userId
 * @param {string} userDisplayName
 * @param {string} avatar
 * 
 * @param {string} workerURL
 */
var mchat = function(chatRootSelector, conversationId, userId, userDisplayName, avatar, workerURL)
{
    this.heartbit = 5000;
    
    this.config = {
        chatRootSelector: chatRootSelector,
        conversationId:   conversationId,
        userId:           userId,
        userDisplayName:  userDisplayName,
        userAvatar:       avatar,
        workerURL:        workerURL,
        options:          { autoLayout:true }
    };
    
    this.started  = false;
    this.interval = 0;
    this.xhr      = null;
    this.working  = false;
    
    this.lastMessageTimestamp = '';
    
    /**
     * @type {Messages}
     */
    this.target = null;
    
    /**
     * @type {Messagebar}
     */
    this.bar = null;
    
    this.__construct = function()
    {
        var _this = this;
        var $root = $(this.config.chatRootSelector);
    
        var template = BCapp.getCompiledTemplate('pages/misc_segments/chat_conversation_template.html');
        var context  = {
            conversationId: this.config.conversationId,
            userDisplayName: this.config.userDisplayName,
            userAvatar: this.config.userAvatar,
            messages: BClanguage.chatMessages
        };
        var html     = template(context);
        $root.find('.chats-root .pages').append(html);
        
        var mchatsel = '#' + this.config.conversationId + ' .messages';
        var mbarsel  = '#' + this.config.conversationId + ' .messagebar';
        var $page    = $('#' + this.config.conversationId);
        var $bar     = $page.find('.messagebar');
        $page.data('mchat', this);
        $page.show('slide', {direction: 'left'}, 100);
        
        $root.find('.users-list .user-trigger:not([rel="' + this.config.conversationId + '"])')
             .toggleClass('selected', false);
        $root.find('.users-list .user-trigger[rel="' + this.config.conversationId + '"]')
             .toggleClass('selected', true);
        
        this.target = BCapp.framework.messages(mchatsel, this.config.options);
        this.bar    = BCapp.framework.messagebar(mbarsel);
        $bar.find('.link.submit').click(this.submitMessage);
        
        $bar.find('textarea').keypress(function(e)
        {
            if( e.keyCode !== 13 ) return;
            if( e.shiftKey ) return;
            
            e.preventDefault();
            $(this).closest('.messagebar').find('.link.submit').click();
        });
        
        this.refresh(this);
        this.interval = setInterval(function() { _this.refresh(_this); }, this.heartbit);
    };
    
    /**
     * Click on message submit button
     */
    this.submitMessage = function()
    {
        var $trigger = $(this);
        var $bar     = $trigger.closest('.messagebar');
        var chat     = $(this).closest('.mchat-conversation').data('mchat');
        
        var message = chat.bar.value().trim();
        if (message.length === 0) return;
        
        // message = message.replace(/\\n/g, '<br>\\n');
        // chat.target.addMessage({
        //     text:   message,
        //     type:   'sent',
        //     day:    ! chat.started ? BClanguage.today : false,
        //     time:   ! chat.started ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
        // });
        // chat.bar.clear();
        // chat.started = true;
        
        var $root        = $(chat.config.chatRootSelector);
        var $servicePage = $root.closest('.service-container');
        var service      = $servicePage.data('service');
        var website      = $servicePage.data('website');
        var manifest     = $servicePage.data('manifest');
        
        var url    = chat.config.workerURL;
        var params = {
            other_user_id: chat.config.userId,
            send_message:  message,
            wasuuup:       BCtoolbox.wasuuup()
        };
        
        $bar.block({message: $.blockUI.defaults.messageSmaller});
        $.post(url, params, function(response)
        {
            $bar.unblock();
            
            if( response !== 'OK' )
            {
                BCtoolbox.addNotification(BCapp.getServiceError(
                    BClanguage.failedToLoadService.title,
                    BClanguage.failedToLoadService.message,
                    website,
                    service,
                    {url: url, error: response}
                ));
                
                return;
            }
            
            chat.bar.clear();
            chat.started = true;
            chat.refresh(chat);
        })
        .fail(function($xhr, status, error)
        {
            $bar.unblock();
            
            BCtoolbox.addNotification(BCapp.getServiceError(
                BClanguage.failedToLoadService.title,
                BClanguage.failedToLoadService.message,
                website,
                service,
                {url: url, error: error}
            ));
        });
    };
    
    this.show = function()
    {
        var $root   = $(this.config.chatRootSelector);
        var $this   = $('#' + this.config.conversationId);
        var $others = $(this.config.chatRootSelector)
                          .find('.chats-root .page:not([id="' + this.config.conversationId + '"])');
        
        $root.find('.users-list .user-trigger:not([rel="' + this.config.conversationId + '"])')
            .toggleClass('selected', false);
        $root.find('.users-list .user-trigger[rel="' + this.config.conversationId + '"]')
            .toggleClass('selected', true);
        
        $this.show();
        $others.hide();
    };
    
    /**
     * @param {mchat} instance
     */
    this.refresh = function(instance)
    {
        if( instance.working ) return;
        
        instance.working = true;
        
        var $root        = $(instance.config.chatRootSelector);
        var $servicePage = $root.closest('.service-container');
    
        /**
         * @type {BCwebsiteServiceDetailsClass}
         */
        var service      = $servicePage.data('service');
    
        /**
         * @type {BCwebsiteClass}
         */
        var website      = $servicePage.data('website');
    
        /**
         * @type {BCwebsiteManifestClass}
         */
        var manifest     = $servicePage.data('manifest');
        
        var dn = $('<span>' + instance.config.userDisplayName + '</span>').text();
        console.log(
            '%c>>> Refreshing chat from %s with %s since %s...',
            'color: green',
            website.userName,
            dn,
            instance.lastMessageTimestamp
        );
        
        var url    = instance.config.workerURL;
        var params = {
            other_user_id: instance.config.userId,
            since:         instance.lastMessageTimestamp,
            wasuuup:       BCtoolbox.wasuuup()
        };
        
        instance.xhr = $.getJSON(url, params, function(data)
        {
            // console.log('%c>>> Done.', 'color: green');
            
            if( data.message !== 'OK' )
            {
                BCtoolbox.addNotification(BCapp.getServiceError(
                    BClanguage.failedToLoadService.title,
                    BClanguage.failedToLoadService.message,
                    website,
                    service,
                    {url: url, error: error}
                ));
                
                instance.working = false;
                
                return;
            }
            
            var unreadCount = data.data.length;
            
            if( unreadCount > 0 )
                console.log('%c>>> %s unread messages received: ', 'color: green', unreadCount, data.data);
            
            for(var i in data.data)
            {
                var message = data.data[i];
                
                instance.lastMessageTimestamp = message.timestamp;
                
                instance.target.addMessage({
                    text:   message.contents,
                    type:   message.type,
                    day:    false,
                    time:   false
                });
            }
            
            instance.started = true;
            instance.working = false;
            
            $('#' + instance.config.conversationId).find('.page-content').scrollTo('max', 100);
            
            var $badge = $root.find(sprintf(
                '.users-list .list-block .user-trigger[data-id-account="%s"] .badge', instance.config.userId
            ));
            
            if( unreadCount === 0 ) $badge.text('').closest('.item-after').hide();
            else                    $badge.text(unreadCount).closest('.item-after').show();
        })
        .fail(function($xhr, status, error)
        {
            instance.working = false;
            
            if( error === 'abort' ) return;
            
            BCtoolbox.addNotification(BCapp.getServiceError(
                BClanguage.failedToLoadService.title,
                BClanguage.failedToLoadService.message,
                website,
                service,
                {url: url, error: error}
            ));
        });
        
    };
    
    this.pause = function()
    {
        if( this.interval ) clearInterval(this.interval);
        if( this.xhr ) this.xhr.abort();
    };
    
    this.resume = function()
    {
        var _this     = this;
        this.interval = setInterval(function() { _this.refresh(_this); }, this.heartbit);
    };
    
    this.__construct();
};
