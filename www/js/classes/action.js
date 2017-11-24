/**
 * @constructor
 */
var BCactionClass = function(source)
{
    this.id = '';
    
    this.module_name = '';
    
    this.script_url = '';
    
    this.call_method = 'get';
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
