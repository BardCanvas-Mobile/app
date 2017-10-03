
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
                    text:    BCapp.language.actions.select,
                    onClick: function() {
                        $('#website_addition_url_textbox').val(url);
                        $('#submit_website_addition').click();
                        BCapp.framework.closeModal();
                    }
                }
            ],
            [
                {
                    text:    BCapp.language.actions.cancel,
                    color:   'red',
                    onClick: function() {
                        BCapp.framework.closeModal();
                    }
                }
            ]
        ];
        BCapp.framework.actions(buttons);
    },
    
    addWebsite: function(url, userName, password) {
        console.log('> URL:      ' + url);
        console.log('> User:     ' + userName);
        console.log('> Password: ' + password);
    }
};
