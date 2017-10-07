
var BCwebsiteAddition = {
    
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
        
        var handler = BCwebsiteAddition.convertSiteURLtoHandler(url);
        console.info('> URL:      ' + url);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        console.info('> Handler:  ' + handler);
        
        BCwebsiteAddition.fetchManifest(handler, url, userName, password, function(manifest) {
            BCwebsiteAddition.fetchManifestRequirements(handler, url, userName, password, manifest);
        });
        return false;
    },
    
    convertSiteURLtoHandler: function(source) {
        source = source.toLowerCase();
        source = source.replace(/http:\/\/|https:\/\//i, '');
        source = source.replace(/\/$/, '');
        source = source.replace(/\//g, '-');
        
        return source;
    },
    
    fetchManifest: function(handler, url, userName, password, callback) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            console.log("Filesystem open: " + fs.name);
            
            fs.root.getDirectory(handler, {create: true, exclusive: false}, function(dir) {
                console.log("Created dir " + dir.name);
                
                fs.root.getFile(dir.name + '/manifest.json', { create: true, exclusive: false }, function (fileEntry) {
                    
                    console.log('Truncating local manifest file...');
                    fileEntry.createWriter(function(writer) {
                        writer.onwriteend = function() {
                            console.log('Local manifest file truncated.');
                            BCtoolbox.showNetworkActivityIndicator();
                            
                            // noinspection JSClosureCompilerSyntax
                            var fileTransfer = new FileTransfer();
                            var target       = fileEntry.toURL();
                            var source       = url + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
                            console.log(sprintf('Fetching "%s"...', source));
                            fileTransfer.download(
                                source,
                                target,
                                function(entry) {
                                    BCtoolbox.hideNetworkActivityIndicator();
                                    
                                    var manifestURL = fileEntry.toURL();
                                    console.log(sprintf('Successful download of %s...', entry.name));
                                    console.log('Local URL to the file: ' + manifestURL);
                                    
                                    fileEntry.file(function (file) {
                                        var reader = new FileReader();
                                        reader.onloadend = function () {
                                            var manifest = new BCwebsiteManifest(JSON.parse(this.result));
                                            console.log("Manifest contents: ", manifest);
                                            
                                            callback(manifest);
                                        };
                                        reader.readAsText(file);
                                    }, function(error) {
                                        BCtoolbox.hideNetworkActivityIndicator();
                                        
                                        console.log(sprintf('Cannot read manifest %s! Error: %s', fileEntry.name, error.code))
                                    });
                                },
                                function(error) {
                                    BCtoolbox.hideNetworkActivityIndicator();
                                    
                                    console.log("> download error source: " + error.source);
                                    console.log("> download error target: " + error.target);
                                    console.log("> download error code: " + error.code);
                                },
                                null
                            );
                        };
                        writer.truncate(0);
                    });
                }, function(error) {
                    console.log('Can\'t download file ' + error.code);
                });
            }, function(error) {
                console.log('Error creating directory ' + error.code);
            });
        }, function(error) {
            console.log('Error calling the local file system API ' + error.code);
        });
    },
    
    /**
     * 
     * @param {string} handler
     * @param {string} url
     * @param {string} userName
     * @param {string} password
     * @param {BCwebsiteManifest} manifest
     */
    fetchManifestRequirements: function(handler, url, userName, password, manifest) {
        console.log('Fetching manifest requirements start');
        console.log('Services: ', manifest.getServices());
        console.log('Fetching manifest requirements end');
    }
};
