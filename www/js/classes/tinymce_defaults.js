
var BCtinyMCEdefaults =
{
    browser_spellcheck:       true,
    menubar:                  false,
    statusbar:                false,
    relative_urls:            false,
    remove_script_host:       false,
    convert_urls:             false,
    selector:                 'NOT-USED-HERE',
    plugins:                  'placeholder advlist autolink lists link anchor searchreplace paste ' +
                              'textcolor fullscreen autoresize image imagetools hr table',
    toolbar:                  'bold italic underline strikethrough | forecolor backcolor | fontsizeselect removeformat | ' +
                              'blockquote outdent indent | hr link unlink |',
    imagetools_toolbar:       'imageoptions',
    paste_data_images:        true,
    fontsize_formats:         '10pt 12pt 14pt 18pt 24pt 36pt',
    content_css:              [],
    content_style:            'body {overflow-y: hidden !important;}',
    autoresize_bottom_margin: 0,
    autoresize_min_height:    100,
    autoresize_max_height:    300,
    entity_encoding:          'raw',
    formats : {
        alignleft:   {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'alignleft'},
        aligncenter: {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'aligncenter'},
        alignright:  {selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes : 'alignright'}
    }
};
