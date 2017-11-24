/**
 * @constructor
 */
var BCactionTriggerClass = function(source)
{
    this.action_id = '';
    
    this.caption = '';
    
    this.icon = '';
    
    this.class = '';
    
    /**
     * key:value pairs of action options
     * 
     * Currently supported options:
     * • boolean remove_on_success      removes closest .bc-actions-parent.
     * • boolean reload_feed_on_success reloads the feed.
     *                                  Implies going to the feed's home page.
     * 
     * @type {Array}
     */
    this.options = [];
    
    /**
     * key:value pairs of params to pass to the action being triggered
     * 
     * @type {object} key:value pairs
     */
    this.params = {};
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
