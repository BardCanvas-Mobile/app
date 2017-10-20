
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
    }
};
