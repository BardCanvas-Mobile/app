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
    
    this.featured_image_path = '';
    
    this.featured_image_thumbnail = '';
    
    this.main_category_title = '';
    
    this.parent_category_title = '';
    
    this.title = '';
    
    this.excerpt = '';
    
    this.content = '';
    
    /**
     * @type {BCfeedItemExtraContentBlockClass}[]
     */
    this.extra_content_blocks = [];
    
    this.comments_count = '';
    
    this.creation_ip = '';
    
    this.creation_location = '';
    
    this.author_can_be_disabled = false;
    
    this.can_be_deleted = false;
    
    this.can_be_drafted = false;
    
    this.can_be_flagged_for_review = false;
    
    // Locally computed
    
    this._showCategoryLabel = true;
    
    this._mainCategoryCaption = '';
    
    this._publishedCaption = '';
    
    this._altPublishedCaption = '';
    
    this._levelCaption = '';
    
    this._levelOnlyCaption = '';
    
    this._memberSinceCaption = '';
    
    if( typeof source === 'undefined' ) return;
    
    // Initialization
    
    for(var i in source) this[i] = source[i];
};
