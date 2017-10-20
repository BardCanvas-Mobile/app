
var BCmanifestsRepository = {
    
    /**
     * @var {BCwebsiteManifestClass[]} Index: website handler
     */
    collection: {},
    
    /**
     * Load manifests for all registered websites
     * 
     * @param {function} callback
     */
    loadAll: function(callback)
    {
        window.tmpWebsiteManifestsToLoad   = BCwebsitesRepository.collection.length;
        window.tmpWebsiteManifestsLoaded   = 0;
        window.tmpWebsiteManifestsInterval = null;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('Filesystem open: ' + fs.name);
            
            for( var i in BCwebsitesRepository.collection )
            {
                var website  = BCwebsitesRepository.collection[i];
                var filePath = website.handler + '.manifest.json';
                
                console.log('Loading manifest file for ' + website.handler);
                fs.root.getFile(filePath, { create: false, exclusive: false }, function(fileEntry)
                {
                    var handler = fileEntry.name.replace('.manifest.json', '');
                    console.log('Handler: ', handler);
                    
                    fileEntry.file(function(file)
                    {
                        var reader = new FileReader();
                        
                        reader.onloadend = function()
                        {
                            if( this.result.length > 0 )
                            {
                                /** @var {BCwebsiteManifestClass} */
                                var manifest = JSON.parse(this.result);
                                BCmanifestsRepository.collection[handler] = manifest;
                                console.log(sprintf(
                                    'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                ));
                            }
                            else
                            {
                                console.log(sprintf('Manifest for %s is empty!', handler));
                                this.__bcmWebsite = null;
                            }
                            
                            window.tmpWebsiteManifestsLoaded++;
                        };
                        
                        reader.readAsText(file);
                    },
                    function(error)
                    {
                        console.log(sprintf(
                            'Cannot Open Website Manifest file for %s: %s',
                            handler,
                            BClanguage.fileErrors[error.code]
                        ));
                        
                        window.tmpWebsiteManifestsLoaded++;
                    });
                },
                function(error, website)
                {
                    console.log(sprintf(
                        'Cannot Open Website Manifest file for %s: %s',
                        website.handler,
                        BClanguage.fileErrors[error.code]
                    ));
                    
                    window.tmpWebsiteManifestsLoaded++;
                });
                
                window.tmpWebsiteManifestsInterval = setInterval(function()
                {
                    if( window.tmpWebsiteManifestsLoaded >= window.tmpWebsiteManifestsToLoad )
                    {
                        clearInterval(window.tmpWebsiteManifestsInterval);
                        
                        callback();
                    }
                    
                    console.log('~ Waiting for website manifests to load.');
                }, 100);
            }
        },
        function(errror)
        {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
    },
    
    /**
     * @param {function} callback
     */
    fetchManifest: function(callback)
    {
        BCapp.framework.showPreloader(BClanguage.checkingWebsite);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url = BCwebsitesRepository.__website.URL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
        $.getJSON(url, function(data)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            BCwebsitesRepository.__manifest = new BCwebsiteManifestClass(data);
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
     * @param {function} callback
     */
    checkManifest: function(callback)
    {
        if( BCwebsitesRepository.__manifest.services.length === 0 )
        {
            BCapp.framework.alert(BClanguage.websiteHasNoServices);
            
            return;
        }
        
        //
        // Case 1: no disclaimer, no login required
        //         '--> Add the site immmediately
        //
        
        if( BCwebsitesRepository.__manifest.disclaimer.length === 0 && ! BCwebsitesRepository.__manifest.loginRequired )
        {
            callback();
            
            return;
        }
        
        //
        // Case 2: no disclaimer, login required
        //         '--> Alert login requirement message and abort if no credentials have been provided
        //
        
        if( BCwebsitesRepository.__manifest.disclaimer.length === 0 && BCwebsitesRepository.__manifest.loginRequired )
        {
            if( BCwebsitesRepository.__website.userName.length === 0 || BCwebsitesRepository.__website.password.length === 0 ) {
                // No login credentials provided
                BCapp.framework.alert(BClanguage.websiteRequiresAuthentication);
            }
            else {
                // Flow is passed to the login validator
                BCmanifestsRepository.__validateWebsiteLogin(function()
                {
                    callback();
                });
            }
            
            return;
        }
        
        //
        // Has disclaimer case inits
        //
        
        var disclaimer = typeof BCwebsitesRepository.__manifest.disclaimer === 'string'
            ? BCwebsitesRepository.__manifest.disclaimer
            : BCwebsitesRepository.__manifest.disclaimer.join(' ');
        
        var content;
        
        //
        // Case 3: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        if( BCwebsitesRepository.__manifest.disclaimer.length > 0 && ! BCwebsitesRepository.__manifest.loginRequired )
        {
            // Flow is passed to the callback
            window.__tempWebsiteAdditionCallback = function() { callback(); };
            
            $.get('pages/website_addition/disclaimer.html', function(html)
            {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.__manifest.shortName,
                    iconURL:            BCwebsitesRepository.__manifest.icon,
                    websiteFullName:    BCwebsitesRepository.__manifest.fullName,
                    companyName:        BCwebsitesRepository.__manifest.company,
                    websiteDescription: BCwebsitesRepository.__manifest.description,
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
        
        if( BCwebsitesRepository.__website.userName.length === 0 || BCwebsitesRepository.__website.password.length === 0 )
        {
            // Missing login credentials
            $.get('pages/website_addition/disclaimer.html', function(html) {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.__manifest.shortName,
                    iconURL:            BCwebsitesRepository.__manifest.icon,
                    websiteFullName:    BCwebsitesRepository.__manifest.fullName,
                    companyName:        BCwebsitesRepository.__manifest.company,
                    websiteDescription: BCwebsitesRepository.__manifest.description,
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
                BCmanifestsRepository.__validateWebsiteLogin(function() {
                    callback();
                });
            };
            
            $.get('pages/website_addition/disclaimer.html', function(html)
            {
                var compiled = Template7.compile(html);
                content      = compiled({
                    websiteName:        BCwebsitesRepository.__manifest.shortName,
                    iconURL:            BCwebsitesRepository.__manifest.icon,
                    websiteFullName:    BCwebsitesRepository.__manifest.fullName,
                    companyName:        BCwebsitesRepository.__manifest.company,
                    websiteDescription: BCwebsitesRepository.__manifest.description,
                    disclaimerContents: disclaimer,
                    cancelButton:       BClanguage.frameworkCaptions.modalButtonCancel,
                    okButton:           BClanguage.frameworkCaptions.modalButtonOk
                });
                BCapp.currentView.router.loadContent(content);
            });
        }
    },
    
    fetchWebsiteManifestImages: function()
    {
        console.log('Here images from manifest should be downloaded!');
    },
    
    /**
     * @param {function} callback
     * 
     * @private
     */
    __validateWebsiteLogin: function(callback)
    {
        BCapp.framework.showPreloader(BClanguage.validatingCredentials);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url    = BCwebsitesRepository.__manifest.loginAuthenticator;
        var params = {
            username: BCwebsitesRepository.__website.userName,
            password: CryptoJS.MD5(BCwebsitesRepository.__website.password).toString(),
            device:   sprintf(
                '%s/%s (%s %s) %s/%s',
                BCapp.name, BCapp.version,
                device.manufacturer, device.platform, device.model, device.version
            )
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
            
            BCwebsitesRepository.__website.accessToken     = data.data.access_token;
            BCwebsitesRepository.__website.userDisplayName = data.data.display_name;
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
     */
    saveManifest: function( callback )
    {
        window.tmpSaveManifestCallback = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath = BCwebsitesRepository.__website.handler + '.manifest.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('Local manifest file truncated successfully.');
                        
                        writer.onwriteend = function()
                        {
                            console.log('Local manifest file saved as: ' + fileEntry.toURL());
                            
                            if( typeof BCmanifestsRepository.collection[BCwebsitesRepository.__website.handler] === 'undefined' )
                                BCmanifestsRepository.collection[BCwebsitesRepository.__website.handler] =
                                    BCwebsitesRepository.__manifest;
                            
                            if( typeof window.tmpSaveManifestCallback === 'function' )
                                window.tmpSaveManifestCallback();
                        };
                        writer.onerror = function(e)
                        {
                            BCapp.framework.alert(sprintf(
                                BClanguage.cannotWriteManifest, e.toString()
                            ));
                        };
                        writer.write( new Blob([JSON.stringify(BCwebsitesRepository.__manifest)], {type: 'text/plain'}) );
                    };
                    writer.onerror = function(e)
                    {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotWriteManifest, e.toString()
                        ));
                    };
                    
                    writer.truncate(0);
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
    }
};
