/**
 * @constructor
 */
var BCfeedItemExtraContentBlockClass = function(source)
{
    this.title = '';
    
    this.class = '';
    
    this.content = '';
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
