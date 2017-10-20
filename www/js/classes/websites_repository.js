
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
                                if( srcSite === null ) continue;
                                
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
        
        BCmanifestsRepository.fetchManifest(function()
        {
            BCmanifestsRepository.checkManifest(function()
            {
                var rootURL = BCwebsitesRepository.__manifest.rootURL;
                var handler = BCwebsitesRepository.convertSiteURLtoHandler(rootURL);
                
                BCwebsitesRepository.__website.manifestFileHandler = handler;
                
                if( BCwebsitesRepository.__website.userName != '' )
                    handler = handler + '-' + BCwebsitesRepository.__website.userName;
                
                BCwebsitesRepository.__website.handler = handler;
                BCwebsitesRepository.__website.URL     = rootURL;
                
                console.info('> Root URL: ' + rootURL);
                console.info('> Handler:  ' + handler);
                
                if( BCwebsitesRepository.__findWebsiteInRegistry(handler, userName) !== null )
                {
                    BCapp.framework.alert( BClanguage.websiteAlreadyAdded );
                    
                    return;
                }
                
                BCmanifestsRepository.saveManifest(function()
                {
                    BCwebsitesRepository.collection[BCwebsitesRepository.collection.length]
                        = BCwebsitesRepository.__website;
                    
                    BCwebsitesRepository.__saveWebsitesRegistry(function()
                    {
                        if( window.tmpReloadAppASAP )
                        {
                            location.reload();
                            
                            return;
                        }
                        
                        BCapp.renderSiteSelector();
                        
                        var website   = BCwebsitesRepository.__website;
                        var handler   = website.handler;
                        var websiteCN = BCwebsitesRepository.convertHandlerToViewClassName(handler);
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
    
    convertHandlerToViewClassName: function(handler)
    {
        return 'view-' + handler.replace(/\./g, '');                                       
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
        
        var websiteCN                  = BCwebsitesRepository.convertHandlerToViewClassName(handler);
        var username                   = $('.' + websiteCN).attr('data-username');
        BCwebsitesRepository.__website = new BCwebsiteClass(BCwebsitesRepository.__findWebsiteInRegistry(handler, username));
        
        BCapp.framework.confirm(
            BClanguage.deleteWebsite.prompt,
            BClanguage.deleteWebsite.title,
            function()
            {
                BCapp.framework.closePanel();
                BCapp.framework.showIndicator();
                
                console.log(sprintf('Starting removal of %s', handler));
                var selector = BCwebsitesRepository.convertHandlerToViewClassName(handler);
                
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
                
                var finishing = function()
                {
                    // Finishing touches
                    console.log(sprintf('Removal of %s completed.', BCwebsitesRepository.__website.handler));
                    
                    // Show website addition view
                    if( BCwebsitesRepository.collection.length > 0 )
                        $('#cancel_website_addition_button').show();
                    else
                        $('#cancel_website_addition_button').hide();
                    
                    BCapp.showView('.view-add-site', function() { BCapp.framework.hideIndicator(); });
                };
                
                // Update websites registry
                BCwebsitesRepository.__saveWebsitesRegistry(function()
                {
                    var timesShared = BCmanifestsRepository.countTimesShared(BCwebsitesRepository.__website.manifestFileHandler);
                    if( timesShared > 0 )
                    {
                        console.log(sprintf(
                            'Manifest %s is being used by a total of %s websites. It will be kept.',
                            BCwebsitesRepository.__website.manifestFileHandler,
                            timesShared
                        ));
                        
                        finishing();
                    }
                    else
                    {
                        // Delete manifest file
                        BCmanifestsRepository.deleteManifest(function()
                        {
                            BCmanifestsRepository.collection =
                                BCtoolbox.removeFromCollection(
                                    BCwebsitesRepository.__website.manifestFileHandler,
                                    BCmanifestsRepository.collection
                                );
                            
                            console.log('Updated manifests collection: ', BCmanifestsRepository.collection);
                            
                            finishing();
                        });
                    }
                    
                });
            },
            function()
            {
                BCapp.framework.closePanel();
            }
        )
    }
};
