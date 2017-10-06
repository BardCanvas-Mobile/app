
var BCwebsiteAddition = {
    
    showFeaturedSiteDetails: function(title, screenShot, url) {
        var buttons = [
            [
                {
                    text:  title,
                    label: true
                },
                {
                    text:  sprintf('<img class="bc-full-width" src="%s">', screenShot),
                    label: true
                },
                {
                    text:    BClanguage.actions.select,
                    onClick: function() {
                        $('#website_addition_url_textbox').val(url);
                        var $page = BCtoolbox.getCurrentPageContentArea();
                        BCapp.framework.closeModal();
                        $page.scrollTo(0, 'fast');
                        $('#add_website_form').submit();
                    }
                }
            ],
            [
                {
                    text:    BClanguage.actions.cancel,
                    color:   'red',
                    onClick: function() {
                        BCapp.framework.closeModal();
                    }
                }
            ]
        ];
        BCapp.framework.actions(buttons);
    },
    
    websiteAdditionSubmission: function(data) {
        
        if( data[0].value.length === 0 ) {
            BCapp.throwError(BClanguage.pleaseProvideAURL);
            
            return false;
        }
        
        var url      = data[0].value;
        var userName = data[1].value;
        var password = data[2].value;
        
        if( url.indexOf(/http/i) < 0 ) url = 'http://' + url;
        
        if( ! BCtoolbox.isValidURL(url) )
        {
            BCapp.throwError(BClanguage.websiteURLisInvalid);
            
            return false;
        }
        
        BCwebsiteAddition.addWebsite(url, userName, password);
        return false;
    },
    
    addWebsite: function(url, userName, password) {
        console.info('> URL:      ' + url);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        
        if( BCapp.os === 'ios' ) NetworkActivityIndicator.show();
        
        var handler   = url.replace(/http:\/\/|https:\/\//i, '').toLowerCase();
        var dir       = BCtoolbox.getFileStorageDirectory(handler);
        alert(dir);
        
        if( BCapp.os === 'ios' ) NetworkActivityIndicator.hide();
    }
};
