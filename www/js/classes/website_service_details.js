/**
 * @param {object} source
 * @constructor
 */
var BCwebsiteServiceDetailsClass = function(source)
{
    this.id = "";
    
    this.caption = '';
    
    this.isOnline = false;
    
    this.url = '';
    
    this.icon = '';
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
