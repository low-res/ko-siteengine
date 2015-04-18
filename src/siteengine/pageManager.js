define([
    "knockout",
    "router",
    "defaultPageTransitionStrategy"
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

        router.routeChanged.add( this.handlePageChange, this );

    }

    p.init = function( routes ) {
        router.setRoutes( routes );
    }

    /**
     * handlePageChange
     * @param {object} newRoute
     */
    p.handlePageChange = function( newRoute, url ) {
        this.pageTransition.handlePageChange( newRoute, url );
    }

    return PageManamger;

});