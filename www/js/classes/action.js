/**
 * @constructor
 */
var BCactionClass = function(source)
{
    this.id = '';
    
    this.module_name = '';
    
    this.script_url = '';
    
    /**
     * @type {string}
     * 
     * Options:
     * 
     * • get: Invokes a remote script with all params specified,
     *   waiting for an "OK" response or an error to display.
     * 
     * • frame: Opens a popup with an iframe to show the specified
     *   page. No response is received whatsoever, so the iframe must
     *   show a "close me" caption for the user to close the popup.
     *   
     * • posting_form_composer: Opens a locally crafted form using
     *   the configuration directives set on the options.
     */
    this.call_method = 'get';
    
    /**
     * key:value pairs of action options
     * 
     * Note: these ones may be overriden by the trigger.
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
