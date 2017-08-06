define([
    "knockout",
    "millermedeiros/crossroads",
    "hasher",
    "signals"
], function (ko, crossroads, hasher, signals) {

    var p = Router.prototype;

    /**
     * Router
     * simple router with hasher+crossroads
     * @param config
     * @constructor
     */
    function Router() {
        var self = this;
        var currentRoute = this.currentRoute = ko.observable({});
        this.initalHash = null;
        this.currentHash = null;
        this.routes = [];
        this.routeChanged = new signals.Signal();
        this.currentRouteIdx = ko.computed(function () {
            var idx = self.routes.indexOf(self.currentRoute());
            return idx;
        });
    }

    p.setRoutes = function( routes ) {
        this.routes = routes;
        this._initRoutes();
        this._activateCrossroads();
        hasher.setHash( this.routes[0].url );
    }

    p.gotoRoute = function ( route ) {
        var knownRoute = this.findRoute( route.id );
        if( knownRoute ) hasher.setHash( knownRoute.url );
        else console.wran( "the given route is not registerd! ", route );
    }

    p.gotoPage = function (idx) {
        hasher.setHash(this.routes[idx].url);
    }

    p.nextPage = function () {
        hasher.setHash(this._getNextPageHash());
    }

    p.prevPage = function () {
        hasher.setHash(this._getPrevPageHash());
    }

    p.findRoute = function(idOrUrl){
        var searchRoutes = function(routes, idOrUrl) {
            var r = null;
            ko.utils.arrayForEach( routes, function(item) {
                if( item.id == idOrUrl || item.url == idOrUrl ) {
                    r = item;
                } else {
                    if( item.children && r==null ) r = searchRoutes(item.children, idOrUrl);
                }
            } );
            return r;
        }
        return searchRoutes(this.routes, idOrUrl);
    }

    p.rootLine = function() {
        var r = [ this.currentRoute() ];
        var p = this.currentRoute().parent;
        while(p) {
            var pRoute = this.findRoute(p.id);
            r.push( pRoute );
            p = pRoute.parent;
        }
        return r;
    }

    p._getNextPageHash = function () {
        var idx = this.routes.indexOf(this.currentRoute());
        var nextRoute = this.routes[idx];
        if (this.routes.length > idx + 1) nextRoute = this.routes[idx + 1];
        return nextRoute.url;
    }

    p._getPrevPageHash = function () {
        var idx = this.routes.indexOf(this.currentRoute());
        var prevRoute = this.routes[idx];
        if (idx > 0) prevRoute = this.routes[idx - 1];
        return prevRoute.url;
    }

    /**
     * _initRoutes
     * @param routes
     * @private
     */
    p._initRoutes = function () {
        var self = this;
        crossroads.removeAllRoutes();
        var setupRoutes = function( childRoutes, parentRoute ) {
            ko.utils.arrayForEach(childRoutes, function (route) {
                route.parent = parentRoute;
                crossroads.addRoute(route.url, function (requestParams) {
                    var r = ko.utils.extend(requestParams, route.params);
                    self.currentRoute(route);
                    self.routeChanged.dispatch(r, route.url);
                });

                if( route.children ) setupRoutes(route.children, route);
            });
        }
        setupRoutes(this.routes, null);
    }


    /**
     * _activateCrossroads
     * @private
     */
    p._activateCrossroads = function () {
        var self = this;

        function parseHash(newHash, oldHash) {
            self.currentHash = newHash;
            crossroads.parse(newHash);
        }

        function parseInitHash(newHash, oldHash) {
            self.initalHash = newHash;
            crossroads.parse(newHash);
        }

        crossroads.normalizeFn = crossroads.NORM_AS_OBJECT;
        hasher.initialized.add(parseInitHash);
        hasher.changed.add(parseHash);
        hasher.init();
    }

    return new Router();
});