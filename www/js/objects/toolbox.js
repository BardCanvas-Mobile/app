
var Toolbox = {
    
    loadPage: function(templateFileName, view, params, callback) {
        var file = sprintf('templates/%s/%s', bcapp.os, templateFileName);
        
        $.get(file, function(sourceHTML) {
            params.template = Template7.compile(sourceHTML);
            view.router.load(params);
            
            if( typeof callback === 'function' ) callback();
        });
    }
    
};
