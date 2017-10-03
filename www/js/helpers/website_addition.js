
var BCwebsiteAddition = {
    
    renderWebsiteAdditionPage: function() {
        BCapp.renderPage(
            'pages/website_addition/index.html',
            BCapp.addSiteView,
            { reload: true },
            function() {
                var $form = $('#add_website_form');
                $form[0].reset();
                $form.ajaxForm({
                    target:       '#ajax_form_target',
                    beforeSubmit: function(data) {
                        BCwebsiteAddition.addWebsite(data[0].value, data[1].value, data[2].value);
                        return false;
                    }
                });
                
                $('.views').fadeOut('fast');
                $('.view-add-site').show('fast');
                BCapp.currentView = BCapp.addSiteView;
            });
    },
    
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
