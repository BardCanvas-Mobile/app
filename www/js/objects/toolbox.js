
var Toolbox = {
    
    renderPage: function(templateFileName, view, params, callback) {
        var os   = bcapp.framework.device.os;
        var file = sprintf('templates/%s/%s', os, templateFileName);
        
        $.get(file, function(sourceHTML) {
            params.template = Template7.compile(sourceHTML);
            view.router.load(params);
            
            if( typeof callback === 'function' ) callback();
        });
    }
    
};
