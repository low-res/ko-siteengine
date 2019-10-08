define([
    "knockout",
    "lodash",
    "./router",
    "postal",
    "./defaultPageTransitionStrategy",
    "./engineevents"
], function(ko, _, router, postal, PageTransition, events) {

    var p       = PageManager.prototype;
    var instance= null;

    /**
     * PageManamger
     *
     * @constructor
     */
    function PageManager( ) {

        // Site properties
        this.routes                     = ko.observableArray();
        this.route                      = router.currentRoute;
        this.routeIdx                   = router.currentRouteIdx;
        this.currentPage                = ko.observable( {} ); // definition of the current page component
        this.pageTransition             = new PageTransition( this.currentPage );
        this.newPageParams              = null;
        this.routerUseHash              = false;

        var subscription = postal.subscribe({
            channel: events.CHANNEL_ROUTER,
            topic: events.ROUTER_ROUTE_CHANGED,
            callback: _.bind(this._handlePageChange, this)
        });

    }


    p.init = function( routes ) {
        router.setRoutes( routes );
        this.routes( routes );
    }


    p.changePageTo = function( idOrUrl, additionalParams ) {

        var r = router.findRoute(idOrUrl);

        // if we are already on the given page, try to set at least the params.
        if( r != this.route() ) {
            this.newPageParams  = additionalParams || null;
            router.gotoPage( idOrUrl );
        } else {
            if( _.isFunction(this.pageTransition.currentPageVmInstance.setParams) ) {
                this.pageTransition.currentPageVmInstance.setParams( additionalParams );
            }
        }
    }


    p.getRootline = function(){
        return router.rootLine();
    }


    p.changeRouteTo = function( route ) {
        router.gotoPage( route.id );
    }


    p.addMiddleware = function ( func ) {
        console.log( "pageManager add Middleware", func );
        router.addMiddleware(func);
    }


    p.removeMiddleware = function ( func ) {
        router.removeMiddleware(func);
    }


    p.setRouterUseHash = function ( flag ) {
        router.setRouterUseHash( flag );
    }


    /**
     * force refresh of current page (usful e.g. if language was changed)
     */
    p.refreshCurrentPage = function () {
        var route = this.route();
        var additionalParams = this.pageTransition.newPageVmParams;
        this.pageTransition.handlePageChange( route.params, route.url, additionalParams );
    }


    /**
     * handlePageChange
     * @param {object} routerEvent
     */
    p._handlePageChange = function( routerEvent ) {
        var route = routerEvent.route;
        if(!this.newPageParams) this.newPageParams  = routerEvent.pageparams
        console.log( "page manager :: _handlePageChange", routerEvent, this.newPageParams );
        this.pageTransition.handlePageChange( route.params, route.url, this.newPageParams );
    }



    p.setPageTransitionObject = function( newPageTransitionObject ) {
        this.pageTransition = newPageTransitionObject;
    }



    PageManager.getInstance = function () {
        if(!instance) {
            instance = new PageManager();
        }
        return instance;
    }


    return PageManager.getInstance();
});