/**
 * @constructor
 */
var BCfeedItemCommentClass = function(source)
{
    // Incoming fields
    
    this.id = '';
    
    this.creation_date = '';
    
    this.content = '';
    
    this.excerpt = '';
    
    this.indent_level = 1;
    
    /**
     * @type {BCContentBlockClass[]}
     */
    this.extra_content_blocks = [];
    
    this.creation_ip = '';
    
    this.creation_location = '';
    
    this.author_id = '';
    
    this.author_user_name = '';
    
    this.author_avatar = '';
    
    this.author_display_name = '';
    
    this.comment_reply_path = '';
    
    this.author_creation_date = '';
    
    this.author_level = 0;
    
    this.has_actions = false;
    
    /**
     * @type {BCactionTriggerClass[]}
     */
    this.action_triggers = [];
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
