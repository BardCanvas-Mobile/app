/**
 * @constructor
 */
var BCwebsiteClass = function(source)
{
    this.URL = '';
    
    this.manifestFileHandler = '';
    
    this.handler = '';
    
    this.userName = '';
    
    this.password = '';
    
    this.userDisplayName = '';
    
    this.accessToken = '';
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
