
var BCwebsiteManifest = function(source) {
    
    this.name = '';
    
    this.version = '';
    
    this.lastUpdate = '';
    
    this.rootURL = '';
    
    this.language = '';
    
    this.company = '';
    
    this.companyPageURL = '';
    
    this.description = '';
    
    this.disclaimer = '';
    
    this.icon = '';
    
    this.loginRequired = '';
    
    this.loginAuthenticator = '';
    
    var services = {};
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source)
    {
        if( i === 'services' ) services = source[i];
        else                   this[i] = source[i];
    }
    
    /**
     * @returns {{BCwebsiteServiceDetails}[]}
     */
    this.getServices = function() {
        if( services.length === 0 ) return {};
        
        var ret = {};
        for(var i in services) ret[i] = new BCwebsiteServiceDetails(services[i]);
        
        return ret;
    }
};
