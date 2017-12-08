
tinymce.PluginManager.add('giphy_for_bardcanvas', function(ed, url)
{
    var $strings = window.$giphyForTinyMCELanguageStrings;
    var _title    = $strings.find('title').text();
    
    var page_url   = 'lib/tinymce-imports/giphy/giphypress/html/giphy.html';
    var plugin_url = 'lib/tinymce-imports/giphygiphypress';
    
    ed.addCommand('giphy_for_bardcanvas', function()
    {
        var width  = $(window).width() - 10;
        var height = $(window).height() - 10;
        if( width  > 482 ) width  = 482;
        if( height > 605 ) height = 605;
        
        // To prevent double openings (no idea why two instances are opened)
        if( ed.windowManager.getWindows().length > 0 ) return;
        
        ed.windowManager.open({
            title:  _title,
            url:    page_url,
            width:  width,
            height: height
        }, {
            plugin_url: plugin_url,            // Plugin absolute URL
            api_key:    'G46lZIryTGCUU',       // the API key
            api_host:   'http://api.giphy.com' // the API host
        });
    });
    
    // Register example button
    ed.addButton('giphy_for_bardcanvas', {
        title: _title,
        cmd:   'giphy_for_bardcanvas',
        image: 'lib/tinymce-imports/giphy/icon_64x64.png'
    });
});

//region Init
//===========

BCtinyMCEdefaults.plugins = BCtinyMCEdefaults.plugins + ' giphy_for_bardcanvas';

BCtinyMCEdefaults.content_css[BCtinyMCEdefaults.content_css.length] = 'lib/tinymce-imports/giphy/styles.css';

BCtinyMCEdefaults.toolbar = BCtinyMCEdefaults.toolbar + ' giphy_for_bardcanvas';

var _lang = navigator.language;
if( _lang.length > 2 ) _lang = _lang.substring(0, 2);
if( _lang === 'es' ) _lang = 'es_LA';
else                 _lang = 'en_US';

var _path = sprintf('lib/tinymce-imports/giphy/language/%s.xml', _lang);
$.get(_path, function(xml) { window.$giphyForTinyMCELanguageStrings = $(xml); });

//=========
//endregion
