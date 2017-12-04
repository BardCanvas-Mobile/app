/**
 * @constructor
 */
var BCactionClass = function(source)
{
    this.id = '';
    
    this.module_name = '';
    
    this.script_url = '';
    
    /**
     * @type {string} Options: get | frame | post
     */
    this.call_method = 'get';
    
    /**
     * key:value pairs of action options
     * Note: options set here override the ones set to the action definition!
     *
     * Currently supported options:
     *
     * • {boolean} requires_confirmation
     *
     * • {string} confirmation_message
     *
     * • {string} success_notification
     *   String to add as notification when the action succeeds.
     *
     * • {boolean} remove_parent_on_success
     *   Removes closest .bc-actions-parent.
     *
     * • {boolean} go_back_on_success
     *   Used only when working on items and the item has been removed,
     *   so the router must step back to the index.
     *
     * @type {Array}
     */
    this.options = [];
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
