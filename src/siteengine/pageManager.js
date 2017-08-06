define([
    "knockout",
    "src/siteengine/router",
    "src/siteengine/defaultPageTransitionStrategy"
], function(ko, router, PageTransition) {

    var p       = PageManamger.prototype;
    var self    = this;

    /**
     * PageManamger
     *
     * @constructor
     */
    function PageManamger( ) {

        // Site properties
        this.route                      = router.currentRoute;
        this.routeIdx                   = router.currentRouteIdx;
        this.currentPage                = ko.observable( {} ); // definition of the current page component
        this.pageTransition             = new PageTransition( this.currentPage );
        this.newPageParams              = null;

        router.routeChanged.add( this.handlePageChange, this );

    }

    p.init = function( routes ) {
        router.setRoutes( routes );
    }



    p.changePageTo = function( idOrUrl, additionalParams ) {
        this.newPageParams  = additionalParams;
        var route           = router.findRoute(idOrUrl);
        router.gotoRoute( route );
    }


    /**
     * handlePageChange
     * @param {object} newRoute
     */
    p.handlePageChange = function( newRoute, url ) {
        this.pageTransition.handlePageChange( newRoute, url, this.newPageParams );
    }



    p.setPageTransitionObject = function( newPageTransitionObject ) {
        this.pageTransition = newPageTransitionObject;
    }

    return PageManamger;

});