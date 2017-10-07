
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
        
        var handler = BCwebsiteAddition.__convertSiteURLtoHandler(url);
        console.info('> URL:      ' + url);
        console.info('> Handler:  ' + handler);
        console.info('> User:     ' + userName);
        console.info('> Password: ' + password);
        var website = new BCwebsiteClass({
            URL:      url,
            handler:  handler,
            userName: userName,
            password: password
        });
        
        BCwebsiteAddition.__fetchManifest(website, function(manifest) {
            website.manifest = manifest;
            BCwebsiteAddition.__presetupWebsiteManifest(website, function(website) {
                    
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
     * @param {BCwebsiteClass} website
     * @param {function}       callback
     * @private
     */
    __fetchManifest: function(website, callback) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            console.log("Filesystem open: " + fs.name);
            
            console.log("Creating dir for " + website.handler);
            fs.root.getDirectory(website.handler, {create: true, exclusive: false}, function(dir) {
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
                            var source       = website.URL + '/bardcanvas_mobile.json?wasuuup=' + BCtoolbox.wasuuup();
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
                                            var manifest = new BCwebsiteManifestClass(JSON.parse(this.result));
                                            
                                            callback(manifest);
                                        };
                                        reader.readAsText(file);
                                    }, function(error) {
                                        BCtoolbox.hideNetworkActivityIndicator();
                                        BCapp.framework.alert(sprintf(
                                            BClanguage.cannotReadManifest, BClanguage.fileErrors[error.code]
                                        ));
                                    });
                                },
                                function(error) {
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
     * @param {BCwebsiteClass} website
     * @param {function}       callback
     * @private
     */
    __presetupWebsiteManifest: function(website, callback) {
        var services = website.manifest.services;
        
        if( services.length === 0 ) {
            BCapp.framework.alert(BClanguage.websiteHasNoServices);
            
            return;
        }
        
        console.log("Website record: ", website);
        
        //
        // Case 1: no disclaimer, no login required
        //         '--> Add the site immmediately
        //
        
        
        
        //
        // Case 1: no disclaimer, login required
        //         '--> Alert login requirement message and abort if no credentials have been provided
        //
        
        
        
        //
        // Case 1: has disclaimer, login required
        //         '--> Show disclaimer and embed login requirement message if no credentials have been provided
        //
        
        
        
        //
        // Case 2: has disclaimer, no login required
        //         '--> Show disclaimer and "proceed" button
        //
        
        
        
    },
    
    /**
     * 
     * @param {BCwebsiteManifestClass} manifest
     * @private
     */
    __fetchWebsiteManifestImages: function(manifest) {
        
    }
};
