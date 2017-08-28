define([
    'knockout',
    './navigation.html!text',
    './navigation.css!css',
    '../../core/pageManager'
], function ( ko, templateMarkup, styles, PageManager ) {

    var p = Navigation.prototype;

    function Navigation( params ) {
        this.routes = PageManager.routes;
        this.route  = PageManager.route;
    }

    p.navigate = function( route ){
        console.log( "navigate", arguments );
        PageManager.changePageTo( route.id, {extraParam:12345} );
    }

    return {
        viewModel: Navigation,
        template: templateMarkup
    };
});