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
     * "html":   Prebuilt HTML.
     *           Whenever possible, single page apps should be set this way.
     *           All URLs in code must be fully qualified.
     *           Forms will be sent using AJAX.
     *           Note: this method will always send the next vars in the request:
     *           • platform     - The platform being called from (ios|android)
     *           • access_token - Pre-authenticated access token
     *           • wasuuup      - A random seed
     * 
     * "feed/cards:simple"   \
     * "feed/cards:modern"    > JSON feed of items, rendered in cards format with the given style.
     * "feed/cards:facebook" /
     * 
     * "feed/media_list" JSON feed of items, rendered as media list.
     */
    this.type = '';
    
    this.url = '';
    
    this.icon = '';
    
    this.requires = null;
    
    /**
     * @type {object}
     * 
     * May include the next elements:
     * 
     * • autoRefreshMinutes:int
     *   Amount of minutes for automatic refresh (feeds only).
     * 
     * • colorTheme:string
     *   Color theme classes.
     * 
     * • showsCommentsOnIndex:boolean
     *   Used by the feed/cards:* types, to include comments in the card contents.
     * 
     * • hasNavbar:boolean
     *   Used to instruct the engine to render a navbar at the top of the page.
     * 
     * • hasTavbar:boolean
     *   Used to instruct the engine to render a toolbar at the bottom of the page.
     * 
     * • navBarHelpers:array
     *   Elements to show on the navbar:
     *   
     *   ○ type:string
     *     "selector"  - to show a popin options selector. When the option changes, the paramName value is updated
     *                   and a refresh of the feed is triggered.
     *     "searchbox" - to show a search widget
     *     
     *   ○ contentsProvider:string
     *     For "selector", is the URL of the script that will provide the options.
     *     - Called once, when the page is loaded.
     *     For "searchbox", is the URL of the script that will deliver search results.
     *     - Called as needed by the search functionality.
     *     
     *   ○ paramName:string
     *     Used for "selector" type. This is the name to pass to the feed getter when the selector option is changed.
     *     
     *   ○ showAuthors:boolean
     *     Specifies if author details are shown everywhere.
     */
    this.options = {};
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
