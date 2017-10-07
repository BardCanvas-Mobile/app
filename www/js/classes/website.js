/**
 * @constructor
 */
var BCwebsiteClass = function(source) {
    
    this.URL = '';
    
    this.handler = '';
    
    this.userName = '';
    
    this.password = '';
    
    /**
     * @type {BCwebsiteManifestClass}
     */
    this.manifest = {};
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
