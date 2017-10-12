
var BCwebsitesRepository = {
    
    /**
     * @var {BCwebsiteClass}
     */
    website: null,
    
    /**
     * @var {BCwebsiteManifestClass}
     */
    manifest: null,
    
    /**
     * @var {BCwebsiteClass[]}
     */
    websitesRegistry: [],
    
    loadWebsitesRegistry: function()
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('Filesystem open: ' + fs.name);
            
            var filePath = 'websites-registry.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function(fileEntry)
            {
                fileEntry.file(function (file)
                {
                    var reader = new FileReader();
                    
                    reader.onloadend = function()
                    {
                        if( this.result.length > 0 )
                        {
                            BCwebsitesRepository.websitesRegistry = JSON.parse(this.result);
                            console.log('Websites registry loaded: ', BCwebsitesRepository.websitesRegistry);
                        }
                        else
                        {
                            console.log('Websites registry is empty.');
                        }
                    };
                    
                    reader.readAsText(file);
                },
                function(error)
                {
                    BCapp.framework.alert(sprintf(
                        BClanguage.cannotOpenWebsitesRegistry, BClanguage.fileErrors[error.code]
                    )); 
                });
            },
            function(error)
            {
                BCapp.framework.alert(sprintf(
                    BClanguage.cannotOpenWebsitesRegistry, BClanguage.fileErrors[error.code]
                ));
            });
        },
        function(errror)
        {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
    },
    
    showFeaturedSiteDetails: function(title, screenShot, url)
    {
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
    
    websiteAdditionSubmission: function(data)
    {
        if( data[0].value.length === 0 )
        {
            BCapp.framework.alert(BClanguage.pleaseProvideAURL);
            
            return false;
        }
        
        var url      = $.trim(data[0].value);
        var userName = $.trim(data[1].value);
        var password = data[2].value;
        
        if( url.search(/http/i) < 0 ) url = 'http://' + url;
        console.log('URL of website to add: ' + url);
        
        if( ! BCtoolbox.isValidURL(url) )
        {
            BCapp.framework.alert(BClanguage.websiteURLisInvalid);
            
            return false;
        }
        
        var handler = BCwebsitesRepository.convertSiteURLtoHandler(url);
        console.info('> URL:      ' + url);
        console.info('> Handler:  ' + handler);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        
        if( userName.length > 0 && password.length == 0 )
        {
            BCapp.framework.alert( BClanguage.passwordMissing );
            
            return;
        }
        
        if( BCwebsitesRepository.__searchWebsiteInRegistry(handler, userName) !== null )
        {
            BCapp.framework.alert( BClanguage.websiteAlreadyAdded );
            
            return;
        }
        
        BCwebsitesRepository.website = new BCwebsiteClass({
            URL:      url,
            handler:  handler,
            userName: userName,
            password: password
        });
        
        BCwebsitesRepository.__fetchManifest(function() {
            BCwebsitesRepository.__checkManifest(function() {
                BCwebsitesRepository.__saveManifest(function() {
                    BCwebsitesRepository.__saveWebsite(function() {
                        
                    });
                });
            });
        });
        return false;
    },
    
    /**
     * @param {string} source
     * 
     * @returns {string}
     */
    convertSiteURLtoHandler: function(source)
    {
        source = source.toLowerCase();
        source = source.replace(/http:\/\/|https:\/\//i, '');
        source = source.replace(/\/$/, '');
        source = source.replace(/\//g, '-');
        
        return source;
    },
    
    /**
     * 
     * @param handler
     * @param userName
     * @returns {BCwebsiteClass | null}
     * @private
     */
    __searchWebsiteInRegistry: function(handler, userName)
    {
        if( BCwebsitesRepository.websitesRegistry.length == 0 ) return null;
        
        console.log(sprintf('Starting search of website %s-%s...', handler, userName));
        
        var inuserName = $.trim(userName.toLowerCase());
        for( var i in BCwebsitesRepository.websitesRegistry )
        {
            var website    = BCwebsitesRepository.websitesRegistry[i];
            var wsUserName = $.trim(website.userName.toLowerCase());
            
            if( website.handler == handler && wsUserName == inuserName )
            {
                console.log('Match found! ', website);
                
                return website;
            }
        }
        
        console.log('Website/username combination not found.');
        return null;
    },
    
    /**
     * 
     * @param {function} callback
     * @private
     */
    __fetchManifest: function(callback)
    {
        BCapp.framework.showPreloader(BClanguage.checkingWebsite);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url = BCwebsitesRepository.website.URL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
        $.getJSON(url, function(data)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            BCwebsitesRepository.manifest = new BCwebsiteManifestClass(data);
            callback();
        })
        .fail(function($xhr, status, error)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            BCapp.framework.alert(sprintf(
                BClanguage.cannotDownloadWebsiteManifest, error
            ));
        });
    },
    
    /**
     *
     * @param {function} callback
     * @private
     */
    __checkManifest: function(callback)
    {
        
        if( BCwebsitesRepository.manifest.services.length === 0 )
        {
            BCapp.framework.alert(BClanguage.websiteHasNoServices);
            
            return;
        }
        
        //
        // Case 1: no disclaimer, no login required
        //         '--> Add the site immmediately
        //
        
        if( BCwebsitesRepository.manifest.disclaimer.length === 0 && ! BCwebsitesRepository.manifest.loginRequired )
        {
            callback();
            
            return;
        }
        
        //
        // Case 2: no disclaimer, login required
        //         '--> Alert login requirement message and abort if no credentials have been provided
        //
        
        if( BCwebsitesRepository.manifest.disclaimer.length === 0 && BCwebsitesRepository.manifest.loginRequired )
        {
            if( BCwebsitesRepository.website.userName.length === 0 || BCwebsitesRepository.website.password.length === 0 ) {
                // No login credentials provided
                BCapp.framework.alert(BClanguage.websiteRequiresAuthentication);
            }
            else {
                // Flow is passed to the login validator
                BCwebsitesRepository.__validateWebsiteLogin(function()
                {
                    callback();
                });
            }
            
            return;
        }
        
        //
        // Has disclaimer case inits
        //
        
        var disclaimer = typeof BCwebsitesRepository.manifest.disclaimer === 'string'
            ? BCwebsitesRepository.manifest.disclaimer
            : BCwebsitesRepository.manifest.disclaimer.join(' ');
        
        var content;
        
        //
        // Case 3: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        if( BCwebsitesRepository.manifest.disclaimer.length > 0 && ! BCwebsitesRepository.manifest.loginRequired )
        {
            // Flow is passed to the callback
            window.__tempWebsiteAdditionCallback = function() { callback(); };
            
            $.get('pages/website_addition/disclaimer.html', function(html)
            {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.manifest.shortName,
                    iconURL:            BCwebsitesRepository.manifest.icon,
                    websiteFullName:    BCwebsitesRepository.manifest.fullName,
                    companyName:        BCwebsitesRepository.manifest.company,
                    websiteDescription: BCwebsitesRepository.manifest.description,
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
        
        if( BCwebsitesRepository.website.userName.length === 0 || BCwebsitesRepository.website.password.length === 0 )
        {
            // Missing login credentials
            $.get('pages/website_addition/disclaimer.html', function(html) {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.manifest.shortName,
                    iconURL:            BCwebsitesRepository.manifest.icon,
                    websiteFullName:    BCwebsitesRepository.manifest.fullName,
                    companyName:        BCwebsitesRepository.manifest.company,
                    websiteDescription: BCwebsitesRepository.manifest.description,
                    disclaimerContents: disclaimer,
                    cancelButton:       BClanguage.frameworkCaptions.modalButtonCancel,
                    warningText:        sprintf(
                        '%s<br>%s', BClanguage.websiteRequiresAuthentication, BClanguage.cancelAndEnterCredentials
                    )
                });
                BCapp.currentView.router.loadContent(content);
            });
        }
        else
        {
            // Login provided. Flow is passed to the login validator
            window.__tempWebsiteAdditionCallback = function() {
                BCwebsitesRepository.__validateWebsiteLogin(function() {
                    callback();
                });
            };
            
            $.get('pages/website_addition/disclaimer.html', function(html)
            {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.manifest.shortName,
                    iconURL:            BCwebsitesRepository.manifest.icon,
                    websiteFullName:    BCwebsitesRepository.manifest.fullName,
                    companyName:        BCwebsitesRepository.manifest.company,
                    websiteDescription: BCwebsitesRepository.manifest.description,
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
    __fetchWebsiteManifestImages: function()
    {
        console.log('Here images from manifest should be downloaded!');
    },
    
    /**
     * @param {function} callback
     * @private
     */
    __validateWebsiteLogin: function(callback)
    {
        BCapp.framework.showPreloader(BClanguage.validatingCredentials);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url    = BCwebsitesRepository.manifest.loginAuthenticator;
        var params = {
            username: BCwebsitesRepository.website.userName,
            password: CryptoJS.MD5(BCwebsitesRepository.website.password).toString(),
            device:   sprintf('%s; %s; %s; %s', device.manufacturer, device.platform, device.model, device.version)
        };
        $.getJSON(url, params, function(data)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            if( data.message !== 'OK' )
            {
                BCapp.framework.alert(data.message);
                
                return;
            }
            
            BCwebsitesRepository.website.accessToken     = data.data.access_token;
            BCwebsitesRepository.website.userDisplayName = data.data.display_name;
            callback();
        })
        .fail(function($xhr, status, error)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            BCapp.framework.alert(sprintf( BClanguage.validatingError, error ));
        });
    },
    
    /**
     * @param {function} callback
     * 
     * @private
     */
    __saveManifest: function( callback )
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath = BCwebsitesRepository.website.handler + '.manifest.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('Local manifest file saved as: ' + fileEntry.toURL());
                        
                        callback();
                    };
                    writer.onerror = function(e)
                    {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotWriteManifest, e.toString()
                        ));
                    };
                    writer.seek(0);
                    writer.write( new Blob([JSON.stringify(BCwebsitesRepository.manifest)], {type: 'text/plain'}) );
                },
                function(error)
                {
                    BCapp.framework.alert(sprintf(
                        BClanguage.cannotOpenManifest, BClanguage.fileErrors[error.code]
                    ));
                });
            },
            function(error)
            {
                BCapp.framework.alert(sprintf(
                    BClanguage.cannotOpenManifest, BClanguage.fileErrors[error.code]
                ));
            });
        },
        function(error)
        {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
    },
    
    /**
     * @private
     */
    __saveWebsite: function(callback)
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath   = 'websites-registry.json';
            var websiteKey = BCwebsitesRepository.website.handler + '-' + BCwebsitesRepository.website.userName;
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('Local website file saved: ' + fileEntry.toURL());
                        
                        callback();
                    };
                    writer.onerror = function(e)
                    {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotWriteWebsitesRegistry, e.toString()
                        ));
                    };
                    
                    BCwebsitesRepository.websitesRegistry[BCwebsitesRepository.websitesRegistry.length]
                        = BCwebsitesRepository.website;
                    writer.seek(0);
                    writer.write(
                        new Blob([JSON.stringify(BCwebsitesRepository.websitesRegistry)], {type: 'text/plain'})
                    );
                },
                function(error)
                {
                    BCapp.framework.alert(sprintf(
                        BClanguage.cannotOpenWebsitesRegistry, BClanguage.fileErrors[error.code]
                    ));
                });
            },
            function(error)
            {
                BCapp.framework.alert(sprintf(
                    BClanguage.cannotOpenWebsitesRegistry, BClanguage.fileErrors[error.code]
                ));
            });
        },
        function(error)
        {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
    }
};
