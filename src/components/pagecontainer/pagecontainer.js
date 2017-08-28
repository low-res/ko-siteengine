define([
    'knockout',
    './pagecontainer.html!text',
    '../../core/pageManager'
], function ( ko, templateMarkup, PageManager ) {

    var p = Pagecontainer.prototype;

    function Pagecontainer(params) {
        console.log( "Pagecontainer",params, PageManager );

        this.pageManager= PageManager;
        this.isError    = ko.observable(false);
        this.errorMsg   = ko.observable("");

        if( !params.routes ) {
            console.error( "Pagecontainer MUST have 'routes' parameter!" );
            this.isError(true);
            this.errorMsg("Pagecontainer MUST have 'routes' parameter! routes is a JSON object that reflects your sitestructure and the pagetypes that are used: [{ id:1,     url: 'einfuehrung',     params: { page: 'page1-intro' } }] ")
        } else {
            PageManager.init(params.routes);
        }

    }

    return {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                console.log( "createViewModel", arguments );
                var p = new Pagecontainer(params);
                console.log( p );
                return p;
            }
        },
        template: templateMarkup
    };

});
