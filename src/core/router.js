define([
    "knockout",
    "lodash",
    "krasimir/navigo",
    "postal",
    "./engineevents"
], function (ko, _, Navigo, postal, events) {

    var p = Router.prototype;

    /**
     * Router
     * simple router with hasher+crossroads
     * @param config
     * @constructor
     */
    function Router() {
        var self = this;
        this.currentRoute   = ko.observable({});
        this.routes         = [];

        // eventbus
        this.eventchannel   = postal.channel( events.CHANNEL_ROUTER );

    }

    p.setRoutes = function( routes ) {
        this.routes = routes;

        // setup navigo https://github.com/krasimir/navigo
        var root = null;
        var useHash = true; // Defaults to: false
        var hash = '#!'; // Defaults to: '#'
        this.navigo = new Navigo(root, useHash, hash);

        this._initRoutes();
    }

    p.getRoutes = function() {
        return this.routes;
    }

    p.gotoRoute = function ( route ) {
        this.gotoPage(route.id);
    }

    p.gotoPage = function (idOrUrl) {
        var knownRoute = this.findRoute( idOrUrl );
        if( knownRoute ) this.navigo.navigate( knownRoute.url );
        else console.warn( "the given route id is not registerd! ", idOrUrl );
    }

    p.nextPage = function () {
        this.gotoRoute(this._getNextPageHash());
    }

    p.prevPage = function () {
        this.gotoRoute(this._getPrevPageHash());
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
        return nextRoute;
    }

    p._getPrevPageHash = function () {
        var idx = this.routes.indexOf(this.currentRoute());
        var prevRoute = this.routes[idx];
        if (idx > 0) prevRoute = this.routes[idx - 1];
        return prevRoute;
    }

    /**
     * _initRoutes
     * @param routes
     * @private
     */
    p._initRoutes = function () {
        var self = this;
        //crossroads.removeAllRoutes();
        var setupRoutes = function( childRoutes, parentRoute ) {
            ko.utils.arrayForEach(childRoutes, function (route) {
                route.parent = parentRoute;
                if(route.url) {
                    self.navigo
                        .on(route.url, function (requestParams) {
                            console.log( "navigo callback", route );
                            var p = route.pageparams ? route.pageparams : {};
                            var r = _.isObject(requestParams) ? ko.utils.extend(requestParams, p) : p;
                            self.currentRoute( route );
                            self.eventchannel.publish( events.ROUTER_ROUTE_CHANGED , {route:route, pageparams:r} );
                        })
                        .resolve();

                    if (route.children) setupRoutes(route.children, route);
                }
            });
        }
        setupRoutes(this.routes, null);
    }

    return new Router();
});
