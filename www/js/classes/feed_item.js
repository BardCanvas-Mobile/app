/**
 * @constructor
 */
var BCfeedItemClass = function(source)
{
    // Incoming fields
    
    this.type = '';
    
    this.id = '';
    
    this.author_user_name = '';
    
    this.author_level = 0;
    
    this.author_avatar = '';
    
    this.author_display_name = '';
    
    this.author_creation_date = '';
    
    this.author_country_name = '';
    
    this.featured_image_id = 0;
    
    this.featured_image_path = '';
    
    this.featured_image_thumbnail = '';
    
    this.has_featured_image = false;
    
    this.featured_image_not_in_contents = false;
    
    this.main_category_title = '';
    
    this.parent_category_title = '';
    
    this.permalink = '';
    
    this.title = '';
    
    this.excerpt = '';
    
    this.publishing_date = '';
    
    this.content = '';
    
    this.tags_list = [];
    
    /**
     * @type {BCContentBlockClass[]}
     */
    this.excerpt_extra_blocks = [];
    
    /**
     * @type {BCContentBlockClass[]}
     */
    this.extra_content_blocks = [];
    
    this.creation_ip = '';
    
    this.creation_location = '';
    
    /**
     * @type {BCactionTriggerClass[]}
     */
    this.index_action_triggers = [];
    
    this.has_index_actions = false;
    
    /**
     * @type {BCactionTriggerClass[]}
     */
    this.item_action_triggers = [];
    
    this.has_item_actions = false;
    
    this.comments_count = '';
    
    /**
     * @type {BCfeedItemCommentClass[]}
     */
    this.comments = [];
    
    this.allow_new_comments = false;
    
    this.add_comment_action = null;
    
    this.comments_limit_for_index = 10;
    
    // Locally computed
    
    this._hasComments = false;
    
    /**
     * @type {BCfeedItemCommentClass[]}
     */
    this._commentsForIndex = [];
    
    this._showCategoryLabel = true;
    
    this._mainCategoryCaption = '';
    
    this._publishedCaption = '';
    
    this._altPublishedCaption = '';
    
    this._levelOnlyCaption = '';
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    var i;
    for(i in source) this[i] = source[i];
    
    //
    // Action triggers for index
    //
    
    var triggers = [];
    if( this.index_action_triggers.length > 0 )
    {
        for(i in this.index_action_triggers)
        {
            triggers[triggers.length] = new BCactionTriggerClass(
                this.index_action_triggers[i]
            );
        }
        
        this.index_action_triggers = triggers;
    }
    
    //
    // Action triggers for single page
    //
    
    triggers = [];
    if( this.item_action_triggers.length > 0 )
    {
        for(i in this.item_action_triggers)
        {
            triggers[triggers.length] = new BCactionTriggerClass(
                this.item_action_triggers[i]
            );
        }
        
        this.item_action_triggers = triggers;
    }
    
    //
    // Comments forging
    //
    
    if( this.comments_count > 0 )
    {
        var comments = [];
        for(i in this.comments )
        {
            comments[comments.length] = new BCfeedItemCommentClass(
                this.comments[i]
            );
        }
        
        this.comments = comments;
    }
};
