/**
 * @param {object} source
 * @constructor
 */
var BCwebsiteManifestClass = function(source)
{
    this.fullName = '';
    
    this.shortName = '';
    
    this.version = '';
    
    this.lastUpdate = '';
    
    this.rootURL = '';
    
    this.contactEmail = '';
    
    this.language = '';
    
    this.company = '';
    
    this.companyPageURL = '';
    
    this.description = '';
    
    /**
     * @type {string|array}
     */
    this.disclaimer = '';
    
    this.icon = '';
    
    this.loginRequired = '';
    
    this.loginAuthenticator = '';
    
    /**
     * @type {BCwebsiteServiceDetailsClass[]}
     */
    this.services = [];
    
    if( typeof source === 'undefined' ) return;
    
    var i = 0;
    
    for(i in source)
        if( i !== 'services' ) this[i] = source[i];
    
    if(source.services)
        for(i in source.services)
            this.services[i] = new BCwebsiteServiceDetailsClass(source.services[i]);
};
