define([
    "knockout",
    "crossroads",
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
        this._initRoutes(routes);
        this._activateCrossroads();
        hasher.setHash( this.routes[0].url );
    }

    p.gotoRoute = function ( route ) {
        var idx = this.routes.indexOf( route );
        if( idx > -1 )hasher.setHash(this.routes[idx].url);
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
        var r = null;
        ko.utils.arrayForEach( this.routes, function(item) {
            if( item.id == idOrUrl || item.url == idOrUrl ) r = item;
        } );
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
    p._initRoutes = function (routes) {
        var self = this;
        ko.utils.arrayForEach(routes, function (route) {
            crossroads.addRoute(route.url, function (requestParams) {
                var r = ko.utils.extend(requestParams, route.params);
                self.currentRoute(route);
                self.routeChanged.dispatch(r, route.url);
            });
        });


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