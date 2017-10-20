
var BCwebsitesRepository = {
    
    /**
     * @var {BCwebsiteClass}
     */
    __website: null,
    
    /**
     * @var {BCwebsiteManifestClass}
     */
    __manifest: null,
    
    /**
     * @var {BCwebsiteClass[]} Index: numeric, incremental
     */
    collection: [],
    
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
                            
                            BCmanifestsRepository.loadAll(window.tmpLoadWebsitesRegistryCallback);
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
        
        console.info('> URL:      ' + url);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        
        if( userName.length > 0 && password.length == 0 )
        {
            BCapp.framework.alert( BClanguage.passwordMissing );
            
            return;
        }
        
        BCwebsitesRepository.__website = new BCwebsiteClass({
            URL:      url,
            userName: userName,
            password: password
        });
        
        BCwebsitesRepository.__fetchManifest(function()
        {
            BCwebsitesRepository.__checkManifest(function()
            {
                var rootURL = BCwebsitesRepository.__manifest.rootURL;
                var handler = BCwebsitesRepository.convertSiteURLtoHandler(rootURL);
                console.info('> Root URL: ' + rootURL);
                console.info('> Handler:  ' + handler);
                
                BCwebsitesRepository.__website.handler = handler;
                BCwebsitesRepository.__website.URL     = rootURL;
                
                if( BCwebsitesRepository.__findWebsiteInRegistry(handler, userName) !== null )
                {
                    BCapp.framework.alert( BClanguage.websiteAlreadyAdded );
                    
                    return;
                }
                
                BCwebsitesRepository.__saveManifest(function()
                {
                    BCwebsitesRepository.collection[BCwebsitesRepository.collection.length]
                        = BCwebsitesRepository.__website;
                    
                    BCwebsitesRepository.__saveWebsitesRegistry(function()
                    {
                        BCapp.renderSiteSelector();
                        
                        var website   = BCwebsitesRepository.__website;
                        var handler   = website.handler;
                        var websiteCN = 'view-' + handler.replace(/[\-\.\/]/g, '');
                        var manifest  = BCwebsitesRepository.__manifest;
                        
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
     * @param {string} url
     * 
     * @returns {string}
     */
    convertSiteURLtoHandler: function(url)
    {
        url = url.toLowerCase();
        url = url.replace(/http:\/\/|https:\/\//i, '');
        url = url.replace(/\/$/, '');
        url = url.replace(/\//g, '-');
        
        return url;
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
     *
     * @param {function} callback
     * @private
     */
    __checkManifest: function(callback)
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
                BCwebsitesRepository.__validateWebsiteLogin(function() {
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
     * 
     * @private
     */
    __saveManifest: function( callback )
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
        
        var websiteCN                  = 'view-' + handler.replace(/[\-\.\/]/g, '');
        var username                   = $('.' + websiteCN).attr('data-username');
        BCwebsitesRepository.__website = BCwebsitesRepository.__findWebsiteInRegistry(handler, username);
        
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
                if( BCmanifestsRepository.collection[handler] )
                {
                    BCmanifestsRepository.collection =
                        BCtoolbox.removeFromCollection(handler, BCmanifestsRepository.collection);
                    
                    console.log('Updated manifests collection: ', BCmanifestsRepository.collection);
                }
                
                // Update websites registry
                BCwebsitesRepository.__saveWebsitesRegistry(function()
                {
                    // Delete manifest file
                    BCwebsitesRepository.__deleteManifest(function()
                    {
                        // Finishing touches
                        console.log(sprintf('Removal of %s completed.', BCwebsitesRepository.__website.handler));
                        
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
            
            var filePath = BCwebsitesRepository.__website.handler + '.manifest.json';
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
