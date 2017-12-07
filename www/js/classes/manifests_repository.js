
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
        window.tmpLoadAllCAllback          = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('Filesystem open for manifest loading: ' + fs.name);
            
            for( var i in BCwebsitesRepository.collection )
            {
                console.log(sprintf('Starting manifset loading loop for website index %s'), i);
                
                var website = BCwebsitesRepository.collection[i];
                if( typeof BCmanifestsRepository.collection[website.manifestFileHandler] !== 'undefined' )
                {
                    console.log(sprintf('~ Manifest for %s already loaded!', website.handler));
                    window.tmpWebsiteManifestsLoaded++;
                    
                    continue;
                }
                
                var filePath = website.manifestFileHandler + '.manifest.json';
                
                console.log('Loading manifest file for ' + website.handler);
                fs.root.getFile(filePath, { create: false, exclusive: false }, function(fileEntry)
                {
                    fileEntry.file(function(file)
                    {
                        var reader = new FileReader();
                        
                        reader.onloadend = function()
                        {
                            if( this.result.length > 0 )
                            {
                                /** @var {BCwebsiteManifestClass} */
                                var manifest = JSON.parse(this.result);
                                var handler  = BCwebsitesRepository.convertSiteURLtoHandler(manifest.rootURL);
                                console.log('Website handler for manifest: ', handler);
                                
                                BCmanifestsRepository.collection[handler] = manifest;
                                console.log(sprintf(
                                    'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                ));
                            }
                            else
                            {
                                console.log(sprintf('Manifest file %s is empty!', fileEntry.name));
                                this.__bcmWebsite = null;
                            }
                            
                            window.tmpWebsiteManifestsLoaded++;
                        };
                        
                        reader.readAsText(file);
                    },
                    function(error)
                    {
                        console.log(sprintf(
                            'Cannot Open Website Manifest file %s: %s',
                            fileEntry.name,
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
            }
        },
        function(errror)
        {
            BCapp.framework.alert(sprintf(
                BClanguage.errorCallingLFSAPI, BClanguage.fileErrors[error.code]
            ));
        });
        
        window.tmpWebsiteManifestsInterval = setInterval(function()
        {
            if( window.tmpWebsiteManifestsLoaded >= window.tmpWebsiteManifestsToLoad )
            {
                clearInterval(window.tmpWebsiteManifestsInterval);
                
                console.log(sprintf('~ %s manifest files loaded.', Object.keys(BCmanifestsRepository.collection).length));
                console.log('~ Manifest loading waiter finished. Passing flow to the callback.');
                window.tmpLoadAllCAllback();
            }
            
            console.log(sprintf(
                '~ Waiting for website manifests to load (%s/%s done)',
                window.tmpWebsiteManifestsLoaded,
                window.tmpWebsiteManifestsToLoad
            ));
        }, 100);
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
        //         '--> Validate if credentials are provided or add the site immmediately
        //
        
        if( BCwebsitesRepository.__manifest.disclaimer.length === 0 && ! BCwebsitesRepository.__manifest.loginRequired )
        {
            if( BCwebsitesRepository.__website.userName.length === 0 || BCwebsitesRepository.__website.password.length === 0 ) {
                // No login credentials provided
                callback();
            }
            else {
                // Flow is passed to the login validator
                BCmanifestsRepository.__validateWebsiteLogin(function() { callback(); });
            }
            
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
                BCmanifestsRepository.__validateWebsiteLogin(function() { callback(); });
            }
            
            return;
        }
        
        //
        // Has disclaimer case inits
        //
        
        var disclaimer = typeof BCwebsitesRepository.__manifest.disclaimer === 'string'
            ? BCwebsitesRepository.__manifest.disclaimer
            : BCwebsitesRepository.__manifest.disclaimer.join(' ');
        
        // Links reforging to popup
        $sanitizedDisclaimer = $('<div>' + disclaimer + '</div>');
        $sanitizedDisclaimer.find('a').each(function()
        {
            var $this = $(this);
            var href = $this.attr('href').replace('"', '&quot;').replace("'", '\'');
            $this.attr('href', null);
            $this.attr('onclick', sprintf("BCapp.openURLinPopup('%s')", href));
        });
        disclaimer = $sanitizedDisclaimer.html();
        
        var compiled, content;
        
        //
        // Case 3: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        if( BCwebsitesRepository.__manifest.disclaimer.length > 0 && ! BCwebsitesRepository.__manifest.loginRequired )
        {
            if( BCwebsitesRepository.__website.userName.length === 0 || BCwebsitesRepository.__website.password.length === 0 )
            {
                // Flow is passed to the callback
                window.__tempWebsiteAdditionCallback = function() { callback(); };
            }
            else {
                // Login provided. Flow is passed to the login validator
                window.__tempWebsiteAdditionCallback = function() {
                    BCmanifestsRepository.__validateWebsiteLogin(
                        function() { callback(); },
                        function() { BCapp.currentView.router.back(); }
                    );
                };
            }
            
            compiled = BCapp.getCompiledTemplate('pages/website_addition/disclaimer.html');
            content  = compiled({
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
            
            return;
        }
        
        //
        // Case 4: has disclaimer, login required
        //         '--> Show disclaimer and embed login requirement message if no credentials have been provided
        //
        
        if( BCwebsitesRepository.__website.userName.length === 0 || BCwebsitesRepository.__website.password.length === 0 )
        {
            // Missing login credentials
            compiled = BCapp.getCompiledTemplate('pages/website_addition/disclaimer.html');
            content  = compiled({
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
        }
        else
        {
            // Login provided. Flow is passed to the login validator
            window.__tempWebsiteAdditionCallback = function() {
                BCmanifestsRepository.__validateWebsiteLogin(
                    function() { callback(); },
                    function() { BCapp.currentView.router.back(); }
                );
            };
            
            compiled = BCapp.getCompiledTemplate('pages/website_addition/disclaimer.html');
            content  = compiled({
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
        }
    },
    
    fetchWebsiteManifestImages: function()
    {
        console.log('Here images from manifest should be downloaded!');
    },
    
    /**
     * @param {function} success
     * @param {function} fail
     * 
     * @private
     */
    __validateWebsiteLogin: function(success, fail)
    {
        BCapp.framework.showPreloader(BClanguage.validatingCredentials);
        BCtoolbox.showNetworkActivityIndicator();
        
        var url = BCwebsitesRepository.__manifest.loginAuthenticator;
        if( url.indexOf('http') < 0 ) url = BCwebsitesRepository.__manifest.rootURL + url;
        
        var params = {
            username: BCwebsitesRepository.__website.userName,
            password: CryptoJS.MD5(BCwebsitesRepository.__website.password).toString(),
            device:   BCapp.userAgent
        };
        console.log('Authenticating with ' + url);
        $.getJSON(url, params, function(data)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            if( data.message !== 'OK' )
            {
                BCapp.framework.alert(data.message);
                if( typeof fail === 'function' ) fail();
                
                return;
            }
            
            BCwebsitesRepository.__website.password        = params.password;
            BCwebsitesRepository.__website.accessToken     = data.data.access_token;
            BCwebsitesRepository.__website.userDisplayName = data.data.display_name;
            
            if( data.data.meta ) BCwebsitesRepository.__website.meta = data.data.meta;
            
            success();
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
            
            var filePath = BCwebsitesRepository.__website.manifestFileHandler + '.manifest.json';
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
                            
                            if( typeof BCmanifestsRepository.collection[BCwebsitesRepository.__website.manifestFileHandler] === 'undefined' )
                            {
                                BCmanifestsRepository.collection[BCwebsitesRepository.__website.manifestFileHandler] =
                                    BCwebsitesRepository.__manifest;
                                
                                if( typeof window.tmpSaveManifestCallback === 'function' )
                                    window.tmpSaveManifestCallback();
                            }
                            else
                            {
                                var oldManifest = BCmanifestsRepository.collection[BCwebsitesRepository.__website.manifestFileHandler];
                                
                                if( oldManifest.version != BCwebsitesRepository.__manifest.version )
                                {
                                    BCapp.framework.confirm(
                                        BClanguage.websiteManifestUpdated.message,
                                        BClanguage.websiteManifestUpdated.title,
                                        function()
                                        {
                                            window.tmpReloadAppASAP = true;
                                            
                                            if( typeof window.tmpSaveManifestCallback === 'function' )
                                                window.tmpSaveManifestCallback();
                                        },
                                        function()
                                        {
                                            if( typeof window.tmpSaveManifestCallback === 'function' )
                                                window.tmpSaveManifestCallback();
                                        }
                                    )
                                }
                                else
                                {
                                    if( typeof window.tmpSaveManifestCallback === 'function' )
                                        window.tmpSaveManifestCallback();
                                }
                            }
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
    },
    
    /**
     * @param {function} callback
     */
    deleteManifest: function( callback )
    {
        window.tmpDeleteManifestCallback = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath = BCwebsitesRepository.__website.manifestFileHandler + '.manifest.json';
            console.log(sprintf('Manifest file to remove: %s'), filePath);
            fs.root.getFile(filePath, { create: false, exclusive: false }, function (fileEntry)
            {
                fileEntry.remove(function(file)
                {
                    console.log(sprintf('Manifest file %s deleted successfully.', fileEntry.name));
                    
                    if( typeof window.tmpDeleteManifestCallback === 'function' )
                        window.tmpDeleteManifestCallback();
                },
                function()
                {
                    console.warn(sprintf(
                        'Unable to delete manifest file %s! This is not critical though.', fileEntry.name
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
     * Return the times the provided manifest is used in all websites
     * 
     * @param {string} manifestHandler
     * @returns {number}
     */
    countTimesShared: function(manifestHandler)
    {
        var shares = 0;
        
        for( var i in BCwebsitesRepository.collection )
            if( BCwebsitesRepository.collection[i].manifestFileHandler === manifestHandler )
                shares++;
        
        return shares;
    },
    
    /**
     * @param {string} websiteURL
     * @returns {BCwebsiteManifestClass}
     */
    getForWebsite: function(websiteURL)
    {
        var manifestHandler = BCwebsitesRepository.convertSiteURLtoHandler(websiteURL);
        
        return BCmanifestsRepository.collection[manifestHandler];
    },
    
    /**
     * @param {string} websiteURL
     * @returns {BCwebsiteServiceDetailsClass[]}
     */
    getServicesForWebsite: function(websiteURL)
    {
        var manifest = BCmanifestsRepository.getForWebsite(websiteURL);
        
        return manifest.services;
    },
    
    /**
     * @param {string} websiteURL
     * @param {string} serviceId
     * @returns {BCwebsiteServiceDetailsClass|null}
     */
    getService: function(websiteURL, serviceId)
    {
        var manifest = BCmanifestsRepository.getForWebsite(websiteURL);
        var services = manifest.services;
        
        for(var i in services)
        {
            var service = services[i];
            if( service.id === serviceId ) return service;
        }
        
        return null;
    }
};
