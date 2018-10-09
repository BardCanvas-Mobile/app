
var BCglobalSettings = 
{
    firstRunCompleted: false,
    
    language: 'en_US',
    
    theme: 'layout-default',
    
    maxImageWidth:     '0', // 480, 640, 1280, 0 (maximum)
    maxJPEGquality:    '90',
    
    maxVideoWidth:     '0',    // 480, 640, 720, 1280, 0 (no limit)
    maxVideoBitrate:   '', // 256k (3 mb/min), 512k (5 mb/min), 1024k (9 mb/min), nothing (no limit)
    // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v  256k resampled-256k.mp4
    // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v  512k resampled-512k.mp4
    // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v 1024k resampled-1024k.mp4
    
    init: function(callback)
    {
        window.tmplSettingsPostInitCallback = callback;
        
        BCglobalSettings.__load(function()
        {
            $('body').removeClass('layout-default layout-dark').addClass( BCglobalSettings.theme );
            
            if( window.tmplSettingsPostInitCallback )
                window.tmplSettingsPostInitCallback();
        });
    },
    
    /**
     * Warning: language vars aren't yet loaded here! All output messages must be in english!
     */
    __load: function(callback)
    {
        window.tmpAfterSettingsLoadCallback = callback;
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log('Filesystem open: ' + fs.name);
            
            var filePath = 'user-settings.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function(fileEntry)
            {
                fileEntry.file(function (file)
                {
                    var reader = new FileReader();
                    
                    reader.onloadend = function()
                    {
                        if( this.result.length > 0 )
                        {
                            var loadedSettings = {};
                            try
                            {
                                loadedSettings = JSON.parse(this.result);
                            }
                            catch(e)
                            {
                                console.warn('The saved user preferences file seems to be corrupted. It wont be loaded.');
                            }
                            
                            console.log('Successfully parsed ' + fileEntry.toURL() );
                            
                            if( Object.keys(loadedSettings).length === 0 )
                            {
                                console.log('User preferences file empty. Nothing loaded.');
                                window.tmpAfterSettingsLoadCallback();
                                
                                return;
                            }
                            
                            for(var i in loadedSettings) BCglobalSettings[i] = loadedSettings[i];
                            console.log('User preferences loaded.');
                            window.tmpAfterSettingsLoadCallback();
                        }
                        else
                        {
                            console.log('User preferences file is empty.');
                            window.tmpAfterSettingsLoadCallback();
                        }
                    };
                    
                    reader.readAsText(file);
                },
                function(error)
                {
                    BCapp.framework.addNotification(sprintf(
                        'Cannot load saved user preferences. Error: %s',
                        error.toString()
                    )); 
                });
            },
            function(error)
            {
                BCapp.framework.addNotification(sprintf(
                    'Cannot open saved user preferences. Error: %s',
                    error.toString()
                ));
            });
        },
        function(error)
        {
            BCapp.framework.addNotification(sprintf(
                'Cannot call filesystem API. Error: %s',
                error.toString()
            ));
        });
    },
    
    set: function(key, value, callback)
    {
        BCglobalSettings[key] = value;
        console.log('> Setting %s set to %s', key, value);
        BCglobalSettings.__save(callback);
        
        if( key === 'theme' )
            $('body').removeClass('layout-default layout-dark').addClass(value);
    },
    
    __save: function(callback)
    {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs)
        {
            console.log("Filesystem open: " + fs.name);
            
            var filePath   = 'user-settings.json';
            fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry)
            {
                fileEntry.createWriter(function(writer)
                {
                    writer.onwriteend = function()
                    {
                        console.log('User preferences file truncated successfully.');
                        
                        writer.onwriteend = function()
                        {
                            console.log('User preferences file saved: ' + fileEntry.toURL());
                            
                            if( callback ) callback();
                        };
                        writer.onerror = function(e)
                        {
                            BCapp.framework.alert(sprintf(
                                BClanguage.cannotWriteSettingsFile, e.toString()
                            ));
                        };
                        writer.write(
                            new Blob([JSON.stringify(BCglobalSettings)], {type: 'text/plain'})
                        );
                    };
                    writer.onerror = function(e)
                    {
                        BCapp.framework.alert(sprintf(
                            BClanguage.cannotWriteSettingsFile, e.toString()
                        ));
                    };
                    
                    writer.truncate(0);
                },
                function(error)
                {
                    BCapp.framework.alert(sprintf(
                        BClanguage.cannotOpenSettingsFile, BClanguage.fileErrors[error.code]
                    ));
                });
            },
            function(error)
            {
                BCapp.framework.alert(sprintf(
                    BClanguage.cannotOpenSettingsFile, BClanguage.fileErrors[error.code]
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
    
    getArgsForRemoteMediaProcessor: function()
    {
        return sprintf(
            'max_image_width:%s,max_jpeg_quality:%s,max_video_width:%s,max_video_bitrate:%s',
            BCglobalSettings.maxImageWidth,
            BCglobalSettings.maxJPEGquality,
            BCglobalSettings.maxVideoWidth,
            BCglobalSettings.maxVideoBitrate
        );
    }
};
