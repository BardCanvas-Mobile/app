
var BCglobalSettingsClass = function() {
    
    // noinspection JSUnusedGlobalSymbols
    this.firstRunCompleted = false;
    
    this.language = 'en_US';
    
    this.storage = 'local';
    
    // noinspection JSUnusedGlobalSymbols
    this.defaultMediaPrefs = {
        downsampleImages:  true,
        maxImageWidth:     1280,
        maxJPEGquality:    60,
        convertPNGtoJPEG:  false,
        maxPNGcompression: 9,
        
        downsampleVideos:  true,
        maxVideoWidth:     720,
        maxVideoBitrate:   "512k", // 1024k (9 mb/min), 512k (5 mb/min), 256k (3 mb/min)
        // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v  256k resampled-256k.mp4
        // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v  512k resampled-512k.mp4
        // ffmpeg -i original.mp4 -vf scale=720:-2 -b:a 128k -ac 2 -b:v 1024k resampled-1024k.mp4
        
        convertAnimatedGIFsToVideos: false
        // ffmpeg -i animated1.gif -movflags faststart -pix_fmt yuv420p -vf "scale=480:-2" -b:v 384k video.mp4
    };
};
