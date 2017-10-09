/**
 * @constructor
 */
var BCwebsiteClass = function(source) {
    
    this.URL = '';
    
    this.handler = '';
    
    this.iconURL = '';
    
    this.serviceIconURLs = [];
    
    this.userName = '';
    
    this.password = '';
    
    this.userDisplayName = '';
    
    this.accessToken = '';
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
