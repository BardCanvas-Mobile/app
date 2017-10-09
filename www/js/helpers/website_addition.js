
var BCwebsiteAddition = {
    
    website: null,
    
    manifest: null,
    
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
        
        if( url.search(/http/i) < 0 ) url = 'http://' + url;
        console.log('URL of website to add: ' + url);
        
        if( ! BCtoolbox.isValidURL(url) )
        {
            BCapp.throwError(BClanguage.websiteURLisInvalid);
            
            return false;
        }
        
        var handler = BCwebsiteAddition.__convertSiteURLtoHandler(url);
        console.info('> URL:      ' + url);
        console.info('> Handler:  ' + handler);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        BCwebsiteAddition.website = new BCwebsiteClass({
            URL:      url,
            handler:  handler,
            userName: userName,
            password: password
        });
        
        BCwebsiteAddition.__fetchManifest(function() {
            BCwebsiteAddition.__checkManifest(function() {
                BCwebsiteAddition.__saveWebsite();
            });
        });
        return false;
    },
    
    /**
     * @param {string} source
     * 
     * @returns {string}
     * @private
     */
    __convertSiteURLtoHandler: function(source) {
        source = source.toLowerCase();
        source = source.replace(/http:\/\/|https:\/\//i, '');
        source = source.replace(/\/$/, '');
        source = source.replace(/\//g, '-');
        
        return source;
    },
    
    /**
     * 
     * @param {function} callback
     * @private
     */
    __fetchManifest: function(callback) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            
            console.log("Filesystem open: " + fs.name);
            console.log("Creating dir for " + BCwebsiteAddition.website.handler);
            
            fs.root.getDirectory(BCwebsiteAddition.website.handler, {create: true, exclusive: false}, function(dir) {
                
                console.log("Created dir " + dir.name);
                
                fs.root.getFile(dir.name + '/manifest.json', { create: true, exclusive: false }, function (fileEntry) {
                    
                    console.log('Truncating local manifest file...');
                    
                    fileEntry.createWriter(function(writer) {
                        writer.onwriteend = function() {
                            // noinspection JSClosureCompilerSyntax
                            var fileTransfer = new FileTransfer();
                            var target       = fileEntry.toURL();
                            var source       = BCwebsiteAddition.website.URL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
                            
                            console.log('Local manifest file truncated.');
                            console.log(sprintf('Fetching "%s"...', source));
                            
                            BCapp.framework.showPreloader(BClanguage.checkingWebsite);
                            BCtoolbox.showNetworkActivityIndicator();
                            fileTransfer.download(
                                source,
                                target,
                                function(entry) {
                                    BCapp.framework.hidePreloader();
                                    BCtoolbox.hideNetworkActivityIndicator();
                                    
                                    var manifestURL = fileEntry.toURL();
                                    
                                    console.log(sprintf('Successful download of %s...', entry.name));
                                    console.log('Local URL to the file: ' + manifestURL);
                                    
                                    fileEntry.file(function (file) {
                                        var reader = new FileReader();
                                        reader.onloadend = function () {
                                            BCwebsiteAddition.manifest =
                                                new BCwebsiteManifestClass(JSON.parse(this.result));
                                            callback();
                                        };
                                        reader.readAsText(file);
                                    }, function(error) {
                                        BCapp.framework.hidePreloader();
                                        BCtoolbox.hideNetworkActivityIndicator();
                                        BCapp.framework.alert(sprintf(
                                            BClanguage.cannotReadManifest, BClanguage.fileErrors[error.code]
                                        ));
                                    });
                                },
                                function(error) {
                                    BCapp.framework.hidePreloader();
                                    BCtoolbox.hideNetworkActivityIndicator();
                                    BCapp.framework.alert(sprintf(
                                        BClanguage.cannotDownloadWebsiteManifest,
                                        BClanguage.fileTransferErrors[error.code]
                                    ));
                                },
                                null
                            );
                        };
                        writer.truncate(0);
                    }, function(error) {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotOpenManifest, BClanguage.fileErrors[error.code]
                        ));
                    });
                }, function(error) {
                    BCapp.framework.alert(sprintf(
                        BClanguage.cannotDownloadWebsiteManifest, BClanguage.fileErrors[error.code]
                    ));
                });
            }, function(error) {
                BCapp.framework.alert(sprintf(
                    BClanguage.unableToCreateWebsiteStorageDir, BClanguage.fileErrors[error.code]
                ));
            });
        }, function(error) {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
    },
    
    /**
     *
     * @param {function} callback
     * @private
     */
    __checkManifest: function(callback) {
        
        if( BCwebsiteAddition.manifest.services.length === 0 ) {
            BCapp.framework.alert(BClanguage.websiteHasNoServices);
            
            return;
        }
        
        //
        // Case 1: no disclaimer, no login required
        //         '--> Add the site immmediately
        //
        
        if( BCwebsiteAddition.manifest.disclaimer.length === 0 && ! BCwebsiteAddition.manifest.loginRequired ) {
            callback();
            
            return;
        }
        
        //
        // Case 2: no disclaimer, login required
        //         '--> Alert login requirement message and abort if no credentials have been provided
        //
        
        if( BCwebsiteAddition.manifest.disclaimer.length === 0 && BCwebsiteAddition.manifest.loginRequired ) {
            if( BCwebsiteAddition.website.userName.length === 0 || BCwebsiteAddition.website.password.length === 0 ) {
                // No login credentials provided
                BCapp.framework.alert(BClanguage.websiteRequiresAuthentication);
            }
            else {
                // Flow is passed to the login validator
                BCwebsiteAddition.__validateWebsiteLogin(function() {
                    callback();
                });
            }
            
            return;
        }
        
        //
        // Has disclaimer case inits
        //
        
        var disclaimer = typeof BCwebsiteAddition.manifest.disclaimer === 'string'
            ? BCwebsiteAddition.manifest.disclaimer
            : BCwebsiteAddition.manifest.disclaimer.join(' ');
        
        var content;
        
        //
        // Case 3: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        if( BCwebsiteAddition.manifest.disclaimer.length > 0 && ! BCwebsiteAddition.manifest.loginRequired ) {
            
            // Flow is passed to the callback
            window.__tempWebsiteAdditionCallback = function() {
                callback();
            };
            
            $.get('pages/website_addition/disclaimer.html', function(html) {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsiteAddition.manifest.shortName,
                    iconURL:            BCwebsiteAddition.manifest.icon,
                    websiteFullName:    BCwebsiteAddition.manifest.fullName,
                    companyName:        BCwebsiteAddition.manifest.company,
                    websiteDescription: BCwebsiteAddition.manifest.description,
                    disclaimerContents: disclaimer,
                    cancelButton:       BClanguage.frameworkCaptions.modalButtonCancel,
                    okButton:           BClanguage.frameworkCaptions.modalButtonOk
                });
                BCapp.currentView.router.loadContent(content);
            });
            
            return;
        }
        
        //
        // Case 4: has disclaimer, login required
        //         '--> Show disclaimer and embed login requirement message if no credentials have been provided
        //
        
        if( BCwebsiteAddition.website.userName.length === 0 || BCwebsiteAddition.website.password.length === 0 ) {
            // Missing login credentials
            $.get('pages/website_addition/disclaimer.html', function(html) {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsiteAddition.manifest.shortName,
                    iconURL:            BCwebsiteAddition.manifest.icon,
                    websiteFullName:    BCwebsiteAddition.manifest.fullName,
                    companyName:        BCwebsiteAddition.manifest.company,
                    websiteDescription: BCwebsiteAddition.manifest.description,
                    warningText:        sprintf(
                        '%s<br>%s', BClanguage.websiteRequiresAuthentication, BClanguage.cancelAndEnterCredentials
                    ),
                    disclaimerContents: disclaimer,
                    cancelButton:       BClanguage.frameworkCaptions.modalButtonCancel
                });
                BCapp.currentView.router.loadContent(content);
            });
        }
        else {
            // Login provided. Flow is passed to the login validator
            window.__tempWebsiteAdditionCallback = function() {
                BCwebsiteAddition.__validateWebsiteLogin(function() {
                    callback();
                });
            };
            
            $.get('pages/website_addition/disclaimer.html', function(html) {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsiteAddition.manifest.shortName,
                    iconURL:            BCwebsiteAddition.manifest.icon,
                    websiteFullName:    BCwebsiteAddition.manifest.fullName,
                    companyName:        BCwebsiteAddition.manifest.company,
                    websiteDescription: BCwebsiteAddition.manifest.description,
                    disclaimerContents: disclaimer,
                    cancelButton:       BClanguage.frameworkCaptions.modalButtonCancel,
                    okButton:           BClanguage.frameworkCaptions.modalButtonOk
                });
                BCapp.currentView.router.loadContent(content);
            });
        }
    },
    
    /**
     * @private
     */
    __fetchWebsiteManifestImages: function() {
        console.log('Here images from manifest should be downloaded!');
    },
    
    /**
     * @param {function} callback
     * @private
     */
    __validateWebsiteLogin: function(callback) {
        BCapp.framework.showPreloader(BClanguage.validatingCredentials);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url    = BCwebsiteAddition.manifest.loginAuthenticator;
        var params = {
            username: BCwebsiteAddition.website.userName,
            password: CryptoJS.MD5(BCwebsiteAddition.website.password).toString()
        };
        $.getJSON(url, params, function(data) {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            if( data.message !== 'OK' ) {
                BCapp.framework.alert(data.message);
                
                return;
            }
            
            BCwebsiteAddition.website.accessToken     = data.data.access_token;
            BCwebsiteAddition.website.userDisplayName = data.data.display_name;
            callback();
        })
        .fail(function($xhr, status, error) {
            
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            BCapp.framework.alert(sprintf( BClanguage.validatingError, error ));
        });
    },
    
    /**
     * @private
     */
    __saveWebsite: function() {
        
        console.log('Here the website must be registered and the sites selector should be refreshed!');
    }
};
