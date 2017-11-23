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
    
    this.title = '';
    
    this.excerpt = '';
    
    this.content = '';
    
    /**
     * @type {BCContentBlockClass}[]
     */
    this.excerpt_extra_blocks = [];
    
    /**
     * @type {BCContentBlockClass}[]
     */
    this.extra_content_blocks = [];
    
    this.creation_ip = '';
    
    this.creation_location = '';
    
    this.index_actions = [];
    
    this.has_index_actions = false;
    
    this.item_actions = [];
    
    this.has_item_actions = false;
    
    this.comments_count = '';
    
    /**
     * @type {BCfeedItemCommentClass}[]
     */
    this.comments = [];
    
    this.allow_new_comments = false;
    
    this.comments_limit_for_index = 10;
    
    // Locally computed
    
    this._hasComments = false;
    
    /**
     * @type {BCfeedItemCommentClass}[]
     */
    this._commentsForIndex = [];
    
    this._showCategoryLabel = true;
    
    this._mainCategoryCaption = '';
    
    this._publishedCaption = '';
    
    this._altPublishedCaption = '';
    
    this._levelOnlyCaption = '';
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
