/**
 * @param {object} source
 * @constructor
 */
var BCwebsiteServiceDetailsClass = function(source)
{
    this.id = "";
    
    this.caption = '';
    
    /**
     * @type {string}
     * 
     * Valid options:
     * 
     * "iframe": Page will be included in an iframe.
     *           Highly discouraged to avoid session issues!
     * 
     * "html":   Prebuilt HTML. No <script> tags allowed.
     *           All URLs must be fully qualified.
     *           Forms will be sent using AJAX.
     *           Whenever possible, single page apps should be set this way.
     *           Note: this method will always send the next vars in the request:
     *           • platform     - The platform being called from (ios|android)
     *           • access_token - Pre-authenticated access token
     *           • wasuuup      - A random seed
     */
    this.type = '';
    
    this.url = '';
    
    this.icon = '';
    
    this.requires = null;
    
    if( typeof source === 'undefined' ) return;
    
    for(var i in source) this[i] = source[i];
};
