
var bcWebsiteAddition = {
    
    renderWebsiteAdditionPage: function() {
        bcapp.toolbox.loadPage(
            'pages/website_addition/index.html',
            bcapp.addSiteView,
            { reload: true },
            function() {
                var $form = $('#add_website_form');
                $form[0].reset();
                $form.ajaxForm({
                    target:       '#ajax_form_target',
                    beforeSubmit: function(data) {
                        bcWebsiteAddition.addWebsite(data[0].value, data[1].value, data[2].value);
                        return false;
                    }
                });
                
                $('.views').fadeOut('fast');
                $('.view-add-site').show('fast');
                bcapp.currentView = bcapp.addSiteView;
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
                    text:    bcapp.language.actions.select,
                    onClick: function() {
                        $('#website_addition_url_textbox').val(url);
                        $('#submit_website_addition').click();
                        bcapp.framework.closeModal();
                    }
                }
            ],
            [
                {
                    text:    bcapp.language.actions.cancel,
                    color:   'red',
                    onClick: function() {
                        bcapp.framework.closeModal();
                    }
                }
            ]
        ];
        bcapp.framework.actions(buttons);
    },
    
    addWebsite: function(url, userName, password) {
        console.log('> URL:      ' + url);
        console.log('> User:     ' + userName);
        console.log('> Password: ' + password);
    }
};
