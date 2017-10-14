
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
     * @var {BCwebsiteClass[]} Index: numeric, incremental
     */
    collection: [],
    
    /**
     * @var {BCwebsiteManifestClass[]} Index: website handler
     */
    manifests: {},
    
    loadWebsitesRegistry: function(callback)
    {
        window.tmpLoadWebsitesRegistryCallback = callback;
        
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
                            try
                            {
                                BCwebsitesRepository.collection = JSON.parse(this.result);
                            }
                            catch(e)
                            {
                                console.warn('The websites registry file seems to be corrupted. It wont be loaded.');
                                BCwebsitesRepository.collection = [];
                            }
                            
                            console.log('Successfully parsed ' + fileEntry.toURL() );
                            console.log('Websites registry loaded: ', BCwebsitesRepository.collection);
                            
                            if( BCwebsitesRepository.collection.length == 0 )
                            {
                                window.tmpLoadWebsitesRegistryCallback();
                                
                                return;
                            }
                            
                            var sanitizedCollection = [];
                            for(var i in BCwebsitesRepository.collection)
                            {
                                var srcSite = BCwebsitesRepository.collection[i];
                                
                                var duplicated = false;
                                for(var i2 in sanitizedCollection)
                                {
                                    var tgtSite = sanitizedCollection[i2];
                                    
                                    if( tgtSite.handler === srcSite.handler )
                                    {
                                        duplicated = true;
                                        
                                        break;
                                    }
                                }
                                
                                if( ! duplicated ) sanitizedCollection[sanitizedCollection.length] = srcSite;
                            }
                            BCwebsitesRepository.collection = sanitizedCollection;
                            
                            BCwebsitesRepository.loadRegisteredManifests(window.tmpLoadWebsitesRegistryCallback);
                        }
                        else
                        {
                            console.log('Websites registry is empty.');
                            window.tmpLoadWebsitesRegistryCallback();
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
    
    loadRegisteredManifests: function(callback)
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
                                BCwebsitesRepository.manifests[handler] = manifest;
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
        
        if( BCwebsitesRepository.__findWebsiteInRegistry(handler, userName) !== null )
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
        
        BCwebsitesRepository.__fetchManifest(function()
        {
            BCwebsitesRepository.__checkManifest(function()
            {
                BCwebsitesRepository.__saveManifest(function()
                {
                    BCwebsitesRepository.collection[BCwebsitesRepository.collection.length]
                        = BCwebsitesRepository.website;
                    
                    BCwebsitesRepository.__saveWebsitesRegistry(function()
                    {
                        BCapp.renderSiteSelector();
                        
                        var website   = BCwebsitesRepository.website;
                        var handler   = website.handler;
                        var websiteCN = 'view-' + handler.replace(/[\-\.\/]/g, '');
                        var manifest  = BCwebsitesRepository.manifest;
                        
                        BCapp.addWebsiteView(website, manifest, websiteCN, function()
                        {
                            BCapp.showView('.' + websiteCN);
                        });
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
    __findWebsiteInRegistry: function(handler, userName)
    {
        if( BCwebsitesRepository.collection.length == 0 ) return null;
        
        console.log(sprintf('Starting search of website %s-%s...', handler, userName));
        
        var inuserName = $.trim(userName.toLowerCase());
        for( var i in BCwebsitesRepository.collection )
        {
            var website    = BCwebsitesRepository.collection[i];
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
     * @param {string} handler
     * @returns {int}
     * @private
     */
    __getIndexOfWebsiteInRegistry: function(handler)
    {
        for(var i in BCwebsitesRepository.collection)
            if( BCwebsitesRepository.collection[i].handler === handler )
                return i;
        
        return -1;
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
        window.tmpSaveManifestCallback = callback;
        
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
                        console.log('Local manifest file truncated successfully.');
                        
                        writer.onwriteend = function()
                        {
                            console.log('Local manifest file saved as: ' + fileEntry.toURL());
                            
                            if( typeof BCwebsitesRepository.manifests[BCwebsitesRepository.website.handler] === 'undefined' )
                                BCwebsitesRepository.manifests[BCwebsitesRepository.website.handler] =
                                    BCwebsitesRepository.manifest;
                            
                            if( typeof window.tmpSaveManifestCallback === 'function' )
                                window.tmpSaveManifestCallback();
                        };
                        writer.onerror = function(e)
                        {
                            BCapp.framework.alert(sprintf(
                                BClanguage.cannotWriteManifest, e.toString()
                            ));
                        };
                        writer.write( new Blob([JSON.stringify(BCwebsitesRepository.manifest)], {type: 'text/plain'}) );
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
     * @private
     */
    __saveWebsitesRegistry: function(callback)
    {
        window.tmpWebsitesRegistryCallback = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath   = 'websites-registry.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('Websites registry file truncated successfully.');
                        
                        writer.onwriteend = function()
                        {
                            console.log('Websites registry file saved: ' + fileEntry.toURL());
                            
                            if( typeof window.tmpWebsitesRegistryCallback === 'function' )
                                window.tmpWebsitesRegistryCallback();
                        };
                        writer.onerror = function(e)
                        {
                            BCapp.framework.alert(sprintf(
                                BClanguage.cannotWriteWebsitesRegistry, e.toString()
                            ));
                        };
                        writer.write(
                            new Blob([JSON.stringify(BCwebsitesRepository.collection)], {type: 'text/plain'})
                        );
                    };
                    writer.onerror = function(e)
                    {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotWriteWebsitesRegistry, e.toString()
                        ));
                    };
                    
                    writer.truncate(0);
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
    },
    
    deleteWebsite: function(handler)
    {
        console.log(sprintf('Requested removal of %s', handler));
        
        var websiteCN = 'view-' + handler.replace(/[\-\.\/]/g, '');
        var username  = $('.' + websiteCN).attr('data-username');
        BCwebsitesRepository.website = BCwebsitesRepository.__findWebsiteInRegistry(handler, username);
        
        BCapp.framework.confirm(
            BClanguage.deleteWebsite.prompt,
            BClanguage.deleteWebsite.title,
            function()
            {
                BCapp.framework.closePanel();
                BCapp.framework.showIndicator();
                
                console.log(sprintf('Starting removal of %s', handler));
                var selector = 'view-' + handler.replace(/[\-\.\/]/g, '');
                
                // Remove website from repository collection
                var index = BCwebsitesRepository.__getIndexOfWebsiteInRegistry(handler);
                BCwebsitesRepository.collection =
                    BCtoolbox.removeFromCollection(index, BCwebsitesRepository.collection);
                console.log('Updated websites collection: ', BCwebsitesRepository.collection);
                
                // Remove website from views
                if( BCapp.viewsCollection[selector] )
                {
                    BCapp.viewsCollection[selector].destroy();
                    $('.' + selector).fadeOut('fast', function() { $(this).remove(); });
                    
                    BCapp.viewsCollection = BCtoolbox.removeFromCollection(selector, BCapp.viewsCollection);
                    console.log('Updated views collection: ', BCapp.viewsCollection);
                }
                
                // Remove menus
                if( BCapp.websiteMenusCollection[selector] )
                {
                    BCapp.websiteMenusCollection =
                        BCtoolbox.removeFromCollection(selector, BCapp.websiteMenusCollection);
                    
                    console.log('Updated menus collection: ', BCapp.websiteMenusCollection);
                }
                
                // Remove manifest from collection
                if( BCwebsitesRepository.manifests[handler] )
                {
                    BCwebsitesRepository.manifests =
                        BCtoolbox.removeFromCollection(handler, BCwebsitesRepository.manifests);
                    
                    console.log('Updated manifests collection: ', BCwebsitesRepository.manifests);
                }
                
                // Update websites registry
                BCwebsitesRepository.__saveWebsitesRegistry(function()
                {
                    // Delete manifest file
                    BCwebsitesRepository.__deleteManifest(function()
                    {
                        // Finishing touches
                        console.log(sprintf('Removal of %s completed.', BCwebsitesRepository.website.handler));
                        
                        // Show website addition view
                        if( BCwebsitesRepository.collection.length > 0 )
                            $('#cancel_website_addition_button').show();
                        else
                            $('#cancel_website_addition_button').hide();
                        
                        BCapp.showView('.view-add-site', function() { BCapp.framework.hideIndicator(); });
                    });
                });
            },
            function()
            {
                BCapp.framework.closePanel();
            }
        )
    },
    
    /**
     * @param {function} callback
     * 
     * @private
     */
    __deleteManifest: function( callback )
    {
        window.tmpDeleteManifestCallback = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath = BCwebsitesRepository.website.handler + '.manifest.json';
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
    }
};
