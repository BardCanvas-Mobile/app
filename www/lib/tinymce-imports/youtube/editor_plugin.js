
tinymce.PluginManager.add('youtube_for_bardcanvas', function(ed)
{
    var $strings  = window.$youtubeForTinyMCELanguageStrings;
    var _title    = $strings.find('title').text();
    var _caption  = $strings.find('caption').text();
    var _invalid  = $strings.find('invalid_link').text();
    
    ed.addCommand('youtube_for_bardcanvas', function()
    {
        ed.windowManager.open({
            title: _caption,
            body: [
                {type: 'textbox', name: 'link', label: 'URL'}
            ],
            onsubmit: function(e)
            {
                var link = e.data.link;
                
                if( link == null ) return;
                
                if( link.match(/^((https:\/\/)?(www\.)?youtube\.com\/watch\?v=.*)|((https:\/\/)?youtu\.be\/.*)/i) == null )
                {
                    ed.windowManager.alert( _invalid );
                    return;
                }
                
                if( link.match(/^https:\/\//i) == null ) link = 'https://' + link;
                
                ed.insertContent(
                    '<a class="youtube_link" href="' + link + '">' + link + '</a>'
                );
            }
        });
    });
    
    ed.addButton('youtube_for_bardcanvas', {
        title: _title,
        cmd:   'youtube_for_bardcanvas',
        image: '/lib/tinymce-imports/youtube/editor_icon.png'
    });
});

//region Init
//===========

BCtinyMCEdefaults.plugins = BCtinyMCEdefaults.plugins + ' youtube_for_bardcanvas';

BCtinyMCEdefaults.content_css[BCtinyMCEdefaults.content_css.length] = '/lib/tinymce-imports/youtube/styles.css';

BCtinyMCEdefaults.toolbar = BCtinyMCEdefaults.toolbar + ' youtube_for_bardcanvas';

var _lang = navigator.language;
if( _lang.length > 2 ) _lang = _lang.substring(0, 2);
if( _lang === 'es' ) _lang = 'es_LA';
else                 _lang = 'en_US';

var _path = sprintf('/lib/tinymce-imports/youtube/language/%s.xml', _lang);
$.get(_path, function(xml) { window.$youtubeForTinyMCELanguageStrings = $(xml); });
$('head').append('<link rel="stylesheet" href="/lib/tinymce-imports/youtube/styles.css">');

//=========
//endregion
