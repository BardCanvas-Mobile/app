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
    
    this.documentLinks = [];
    
    this.icon = '';
    
    this.loginRequired = '';
    
    this.loginAuthenticator = '';
    
    this.timezoneOffset = 0;
    
    this.userLevels = BClanguage.defaultUserLevels;
    
    /**
     * @type {BCwebsiteServiceDetailsClass[]}
     */
    this.services = [];
    
    /**
     * @type {BCactionClass[]}
     */
    this.actionsRegistry = {};
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    var i;
    
    for(i in source)
        if( i !== 'services' ) this[i] = source[i];
    
    if(source.services)
        for(i in source.services)
            this.services[i] = new BCwebsiteServiceDetailsClass(source.services[i]);
};
