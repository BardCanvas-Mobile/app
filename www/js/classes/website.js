/**
 * @constructor
 */
var BCwebsiteClass = function(source) {
    
    this.URL = '';
    
    this.handler = '';
    
    this.userName = '';
    
    this.password = '';
    
    this.iconURL = '';
    
    this.serviceIconURLs = [];
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
