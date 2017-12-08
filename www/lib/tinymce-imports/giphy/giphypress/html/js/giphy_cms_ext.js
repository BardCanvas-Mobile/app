var GiphyCMSExt = {
  init: function() {
    jQuery('#gif-inject-cms').html('<button class="button button-hero" onclick="GiphyCMSExt.doTinyMCEEmbed()">Embed into post</button>');
  },
  doTinyMCEEmbed: function() {


    console.log("doTinyMCEEmbed");

    var embedId = jQuery('img#gif-detail-gif').attr('data-id');
    var width = jQuery('img#gif-detail-gif').attr('data-width');
    var height = jQuery('img#gif-detail-gif').attr('data-height');

    // var uri = '[iframe src="http://giphy.com/embed/' + embedId + '" width="' + width + '" height="' + height + '" frameBorder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen][/iframe]';
    var uri = 'https://media.giphy.com/media/' + embedId + '/giphy.gif';

    // parent.tinyMCE.activeEditor.execCommand("mceInsertRawHTML", false, uri);
    // parent.tinyMCE.activeEditor.execCommand("mceInsertContent", false, "<img src='" + uri + "' width='" + width + "' alt='giphy gif'>");
    parent.tinyMCE.activeEditor.execCommand("mceInsertContent", false, "<img class='giphy' src='" + uri + "' alt='giphy gif'>");
    parent.tinyMCE.activeEditor.selection.select(parent.tinyMCE.activeEditor.getBody(), true); // ed is the editor instance
    parent.tinyMCE.activeEditor.selection.collapse(false);
    parent.tinyMCE.activeEditor.windowManager.close(window);
  }
};