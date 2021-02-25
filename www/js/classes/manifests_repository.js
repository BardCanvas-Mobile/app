
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
        window.tmpWebsiteManifestsToLoad    = BCwebsitesRepository.collection.length;
        window.tmpWebsiteManifestsLoaded    = 0;
        window.tmpLoadAllCAllback           = callback;
        window.tmpUpdatedManifestsByHandler = {};
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('Filesystem open for manifest loading: ' + fs.name);
            
            for( var i in BCwebsitesRepository.collection )
            {
                console.log('Starting manifset loading loop for website index %s', i);
                
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
                                if( manifest === null )
                                {
                                    console.log('Manifest is corrupted. Skipping.');
                                    window.tmpWebsiteManifestsLoaded++;
                                    
                                    return;
                                }
                                
                                var handler  = BCwebsitesRepository.convertSiteURLtoHandler(manifest.rootURL);
                                console.log('Website handler for manifest: ', handler);
                                
                                if( typeof window.tmpUpdatedManifestsByHandler[handler] !== 'undefined')
                                {
                                    BCmanifestsRepository.collection[handler] = manifest;
                                    console.log(sprintf(
                                        'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                    ));
                                    
                                    window.tmpWebsiteManifestsLoaded++;
                                    
                                    return;
                                }
                                
                                window.tmpUpdatedManifestsByHandler[handler] = true;
                                console.log('%cFetching remote manifest for %s...', 'color: crimson', handler);
                                var url = manifest.rootURL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
                                $.ajax({
                                    url:      url,
                                    timeout:  5000,
                                    dataType: 'json'
                                })
                                .done(function(newManifest)
                                {
                                    if( parseFloat(newManifest.version) !== parseFloat(manifest.version) )
                                    {
                                        manifest = newManifest;
                                        console.log('%cManifest %s has changed!!! needs to be saved!!!', 'color: crimson', fileEntry.name);
                                        
                                        BCmanifestsRepository.updateManifest(manifest, fileEntry.name, function()
                                        {
                                            BCmanifestsRepository.collection[handler] = manifest;
                                            console.log(sprintf(
                                                'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                            ));
                                            
                                            window.tmpWebsiteManifestsLoaded++;
                                        });
                                        
                                        return;
                                    }
                                    
                                    BCmanifestsRepository.collection[handler]    = manifest;
                                    console.log(sprintf(
                                        'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                    ));
                                    
                                    window.tmpWebsiteManifestsLoaded++;
                                })
                                .fail(function($xhr, status, error)
                                {
                                    console.log('%cCannot update local manifest: %s', 'color: teal', error);
                                    
                                    BCmanifestsRepository.collection[handler] = manifest;
                                    console.log(sprintf(
                                        'Manifest for %s (%s) loaded. URL: %s', handler, manifest.shortName, fileEntry.toURL()
                                    ));
                                    
                                    window.tmpWebsiteManifestsLoaded++;
                                });
                            }
                            else
                            {
                                console.log(sprintf('Manifest file %s is empty!', fileEntry.name));
                                this.__bcmWebsite = null;
                                
                                window.tmpWebsiteManifestsLoaded++;
                            }
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
        function(error)
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
    
        BCwebsitesRepository.__manifest = null;
        
        var url = BCwebsitesRepository.__website.URL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
        $.ajax({
            url:      url,
            timeout:  5000,
            dataType: 'json'
        })
        .done(function(data)
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
        
        var websiteHasDisclaimer        = BCwebsitesRepository.__manifest.disclaimer.length > 0;
        var userWantsFacebookLogin      = $('#add_website_form').find('input[name="use_facebook_login"]').val() === 'true';
        var userProvidesAuthCredentials = BCwebsitesRepository.__website.userName.length > 0 &&
                                          BCwebsitesRepository.__website.password.length > 0;
        
        if( ! websiteHasDisclaimer && ! BCwebsitesRepository.__manifest.loginRequired )
        {
            if( userWantsFacebookLogin )
            {
                // Flow is passed to Facebook login helper
                BCmanifestsRepository.__doFacebookAuthentication(callback);
            }
            else if( ! userProvidesAuthCredentials )
            {
                // No login credentials provided
                callback();
            }
            else
            {
                // Flow is passed to the login validator with standard credentials
                BCmanifestsRepository.__validateWebsiteLogin(callback);
            }
            
            return;
        }
        
        //
        // Case 2: no disclaimer, login required
        //         '--> Alert login requirement message and abort if no credentials have been provided
        //
        
        if( ! websiteHasDisclaimer && BCwebsitesRepository.__manifest.loginRequired )
        {
            if( userWantsFacebookLogin )
            {
                // Flow is passed to Facebook login helper
                BCmanifestsRepository.__doFacebookAuthentication(callback);
            }
            else if( ! userProvidesAuthCredentials )
            {
                // No login credentials provided
                BCapp.framework.alert(BClanguage.websiteRequiresAuthentication);
            }
            else
            {
                // Flow is passed to the login validator with credentials
                BCmanifestsRepository.__validateWebsiteLogin(callback);
            }
            
            return;
        }
        
        //
        // Has disclaimer case inits
        //
        
        var disclaimer = typeof BCwebsitesRepository.__manifest.disclaimer === 'string'
            ? BCwebsitesRepository.__manifest.disclaimer
            : BCwebsitesRepository.__manifest.disclaimer.join('\n');
        
        // Links reforging to popup
        $sanitizedDisclaimer = $('<div>' + disclaimer + '</div>');
        $sanitizedDisclaimer.find('a').each(function()
        {
            var $this = $(this);
            var href = $this.attr('href').replace('"', '&quot;').replace("'", '\'');
            if( href.indexOf('?') < 0 ) href = href + '?bcm_minimalistic_mode_enforced=true';
            else                        href = href + '&bcm_minimalistic_mode_enforced=true';
            $this.attr('href', null);
            $this.attr('onclick', sprintf("BCapp.openURLinPopup('%s')", href));
        });
        disclaimer = $sanitizedDisclaimer.html();
        
        var compiled, content;
        
        //
        // Case 3: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        if( ! BCwebsitesRepository.__manifest.loginRequired )
        {
            if( userWantsFacebookLogin )
            {
                // Flow is passed to the Facebook Login Helper
                window.__tempWebsiteAdditionCallback = function() {
                    BCmanifestsRepository.__doFacebookAuthentication(callback, true);
                };
            }
            else if( ! userProvidesAuthCredentials )
            {
                // Flow is passed to the callback
                window.__tempWebsiteAdditionCallback = callback;
            }
            else
            {
                // Login provided. Flow is passed to the login validator
                window.__tempWebsiteAdditionCallback = function() {
                    BCmanifestsRepository.__validateWebsiteLogin(
                        callback,
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
        
        if( userWantsFacebookLogin )
        {
            // Login provided. Flow is passed to the Facebook Login helper
            window.__tempWebsiteAdditionCallback = function()
            {
                BCmanifestsRepository.__doFacebookAuthentication(callback, true);
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
            
            return;
        }
        
        if( ! userProvidesAuthCredentials )
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
            window.__tempWebsiteAdditionCallback = function()
            {
                BCmanifestsRepository.__validateWebsiteLogin(
                    callback,
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
     * @param {string}   tfaCode
     * @private
     */
    __validateWebsiteLogin: function(success, fail, tfaCode)
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
        if( typeof tfaCode !== 'undefined' ) params.tfa_code = tfaCode;
        
        console.log('Authenticating with ' + url);
        $.getJSON(url, params, function(data)
        {
            BCapp.framework.hidePreloader();
            BCtoolbox.hideNetworkActivityIndicator();
            
            if( data.message === '@ASK_FOR_2FA' )
            {
                console.log('2FA code input requested');
                
                var okClicked = function(value)
                {
                    console.log('Code introduced: ' + value);
                    BCmanifestsRepository.__validateWebsiteLogin(success, fail, value);
                }
                
                var cancelClicked = function()
                {
                    console.log('2FA code input cancelled');
                    if( typeof fail === 'function' ) fail();
                }
                
                var pText  = BClanguage.tfaPromptText;
                var pTitle = BClanguage.tfaPromptTitle;
                
                BCapp.framework.prompt(pText, pTitle, okClicked, cancelClicked);
                
                return;
            }
            
            if( data.message !== 'OK' )
            {
                BCapp.framework.alert(data.message);
                if( typeof fail === 'function' ) fail();
                
                return;
            }
            
            BCwebsitesRepository.__website.password        = params.password;
            BCwebsitesRepository.__website.accessToken     = data.data.access_token;
            BCwebsitesRepository.__website.userDisplayName = data.data.display_name;
            
            if( data.data.meta )
            {
                BCwebsitesRepository.__website.meta     = data.data.meta;
                BCwebsitesRepository.__website.userName = data.data.user_name;
            }
            
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
     * @param {object}   manifest
     * @param {string}   filePath
     * @param {function} callback
     */
    updateManifest: function( manifest, filePath, callback )
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('%cFilesystem open: %s', 'color: crimson', fs.name);
            
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('%cLocal manifest file %s truncated successfully.', 'color: crimson', filePath);
                        
                        writer.onwriteend = function()
                        {
                            console.log('%cLocal manifest file updated as: %s', 'color: crimson', fileEntry.toURL());
                            
                            callback();
                        };
                        writer.onerror = function(e)
                        {
                            console.log('%sUnable to save manifest file %s: %s', 'color: crimson', filePath, e.toString());
                            
                            callback();
                        };
                        writer.write( new Blob([JSON.stringify(manifest)], {type: 'text/plain'}) );
                    };
                    writer.onerror = function(e)
                    {
                        console.log('%cUnable to truncate manifest file %s: %s', 'color: crimson', filePath, e.toString());
    
                        callback();
                    };
                    
                    writer.truncate(0);
                },
                function(error)
                {
                    console.log('%cUnable to open manifest file %s: %s', 'color: crimson', filePath, BClanguage.fileErrors[error.code]);
                    
                    callback();
                });
            },
            function(error)
            {
                console.log('%cUnable to open manifest file %s: %s', 'color: crimson', filePath, BClanguage.fileErrors[error.code]);
                
                callback();
            });
        },
        function(error)
        {
            console.log('%cUnable to open filesystem API: %s', 'color: crimson', BClanguage.fileErrors[error.code]);
            
            callback();
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
    },
    
    __doFacebookAuthentication: function(callback, closeDisclaimerOnCancel)
    {
        if( typeof closeDisclaimerOnCancel === 'undefined' ) closeDisclaimerOnCancel = false;
        
        console.log('%cFacebook auth goes here!', 'color: white; background-color: blue;');
        
        var confirm = function()
        {
            var rawToken = Date.now() + ':' + parseInt(Math.random() * 1000000000000000).toString();
            
            window.tmpFacebookAuthCheckerToken = CryptoJS.MD5(rawToken).toString();
            window.tmpFacebookAuthCheckerXHR   = null;
            window.tmpFacebookAuthCanceller    = function()
            {
                clearInterval( window.tmpFacebookAuthCheckerInterval );
                BCapp.framework.hidePreloader();
                if( closeDisclaimerOnCancel ) BCapp.currentView.router.back();
                
                console.log('%cShutting down remote Facebook authentication listener.', 'color: blue');
                
                if( window.tmpFacebookAuthCheckerXHR ) window.tmpFacebookAuthCheckerXHR.abort();
            };
            
            var element = BCapp.framework.showPreloader(BClanguage.facebookLoginHelper.preloaderCaption);
            $(element).click(function() { window.tmpFacebookAuthCanceller(); });
    
            window.tmpFacebookAuthCheckerRunning  = false;
            window.tmpFacebookAuthCheckerFunction = function(callback)
            {
                if( window.tmpFacebookAuthCheckerRunning ) return;
                
                var url    = BCwebsitesRepository.__manifest.facebookLoginChecker;
                var params = {
                    mode:    'background_check',
                    token:   window.tmpFacebookAuthCheckerToken,
                    wasuuup: BCtoolbox.wasuuup()
                };
                
                window.tmpFacebookAuthCheckerRunning = true;
                console.log('%cFetching %s with %s...', 'color: blue', url, JSON.stringify(params));
                window.tmpFacebookAuthCheckerXHR = $.getJSON(url, params, function(data)
                {
                    window.tmpFacebookAuthCheckerRunning = false;
                    if( data.message === 'ERROR:FILE_NOT_FOUND' ) return;
                    
                    if( data.message !== 'OK' )
                    {
                        window.tmpFacebookAuthCanceller();
                        
                        BCapp.framework.alert(sprintf(BClanguage.facebookLoginHelper.incomingError, data.message));
                        
                        return;
                    }
                    
                    BCwebsitesRepository.__website.accessToken     = data.data.access_token;
                    BCwebsitesRepository.__website.userName        = data.data.user_name;
                    BCwebsitesRepository.__website.userDisplayName = data.data.display_name;
                    
                    if( data.data.meta ) BCwebsitesRepository.__website.meta = data.data.meta;
                    
                    window.tmpFacebookAuthCanceller();
                    if( callback ) callback();
                })
                .fail(function($xhr, satus, error)
                {
                    window.tmpFacebookAuthCheckerRunning = false;
                    console.log('%cCan\'t get JSON data: %s', 'color: blue', status);
                    
                    window.tmpFacebookAuthCanceller();
                    
                    BCapp.framework.alert(sprintf(BClanguage.facebookLoginHelper.ajaxError, data.message));
                });
                // if( typeof callback === 'function' ) callback();
            };
            
            window.tmpFacebookAuthCheckerInterval = setInterval(
                function() { window.tmpFacebookAuthCheckerFunction(callback); },
                3000
            );
            
            var url = BCwebsitesRepository.__manifest.facebookLoginChecker;
            if( url.indexOf('?') < 0 ) url = url + '?';
            else                       url = url + '&';
            
            url = url + 'token='    + window.tmpFacebookAuthCheckerToken;
            url = url + '&wasuuup=' + BCtoolbox.wasuuup();
            url = url + '&device='  + encodeURI(BCapp.userAgent);
            console.log('%cLaunching native browser window to %s', 'color: blue', url);
            window.open(url, '_system');
        };
        
        var cancel = function()
        {
            if( closeDisclaimerOnCancel )
                BCapp.currentView.router.back();
        };
        
        BCapp.framework.confirm(
            BClanguage.facebookLoginHelper.info,
            BClanguage.facebookLoginHelper.title,
            confirm,
            cancel
        );
    }
};
