define([
    "knockout",
    "lodash",
    "krasimir/navigo",
    "postal",
    "./engineevents"
], function (ko, _, Navigo, postal, events) {

    var p = Router.prototype;
    var instance = null;
    var instanceCount = 0;

    /**
     * Router
     * simple router with hasher+crossroads
     * @param config
     * @constructor
     */
    function Router() {
        var self            = this;
        this.c = ++instanceCount;
        this.currentRoute   = ko.observable({});
        this.routes         = [];
        this.middlewares    = [];
        this._lastValidRoute= null;
        this._routerUseHash = false;
        this._notFoundRoute = null;

        // eventbus
        this.eventchannel   = postal.channel( events.CHANNEL_ROUTER );
    }



    p.setRoutes = function( routes ) {
        this.routes = routes;
        this._setupNavigo();
    }



    p.getRoutes = function() {
        return this.routes;
    }



    p.gotoRoute = function ( route ) {
        this.gotoPage(route.id);
    }



    p.gotoPage = function (idOrUrl) {
        var knownRoute = this.findRoute( idOrUrl );
        console.log( "searched for route ", knownRoute );
        if( knownRoute ) {
            if( this._isUrlMatchingWithParametrisedRoute(knownRoute.url,idOrUrl) ) {
                this.navigo.navigate( idOrUrl );
            } else {
                this.navigo.navigate( knownRoute.url );
            }
        }
        else {
            console.warn( "the given route id is not registerd! ", idOrUrl );
            this.navigo.navigate( idOrUrl );
        }
    }



    p.nextPage = function () {
        this.gotoRoute(this._getNextPageHash());
    }



    p.prevPage = function () {
        this.gotoRoute(this._getPrevPageHash());
    }



    p.findRoute = function(idOrUrl) {
        var self = this;

        var searchRoutes = function(routes, idOrUrl) {
            var r = null;
            ko.utils.arrayForEach( routes, function(item) {
                if( item.id == idOrUrl || self._isUrlMatchingWithParametrisedRoute(item.url,idOrUrl) ) {
                    r = item;
                } else {
                    if( item.children && r==null ) r = searchRoutes(item.children, idOrUrl);
                }
            } );
            return r;
        }
        return searchRoutes(this.routes, idOrUrl);
    }


    p._isUrlMatchingWithParametrisedRoute = function( routeURL, currentURL ) {
        var routeparts = _.isString(routeURL) ? routeURL.split("/") : [];
        var urlparts = _.isString(currentURL) ? currentURL.split("/") : [];

        if( routeparts.length == urlparts.length ) {
            var res = true;
            for(var i=0; i < routeparts.length; i++) {
                var routepart = routeparts[i];
                var urlpart = urlparts[i];
                res = res && (routepart==urlpart || routepart[0] == ":")
            }
            return res;
        }
        return false;
    }


    p.rootLine = function() {
        var r = [ this.currentRoute() ];
        var p = this.currentRoute().parent;
        while(p) {
            r.push( p );
            p = p.parent;
        }
        return r;
    }



    /**
     * add an before-hook to the router.
     * with this it is possible to include
     * individual checks before allowing to go
     * to the desired url.
     */
    p.addMiddleware = function ( func ) {
        this.middlewares.push( func );
        console.log( "addMiddleware", this );
        this._setupNavigo();
        return func;
    }


    p.removeMiddleware = function (func) {
        _.pull(this.middlewares, func);
    }


    p.setRouterUseHash = function ( flag ) {
        this._routerUseHash = flag;
        this._setupNavigo();
    }


    p.setNotFoundRoute = function ( route ) {
        this._notFoundRoute = route;
    }


    p.getNotFoundRoute = function () {
        if( this._notFoundRoute ) return this._notFoundRoute;
        else return this.routes[0];
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



    p._setupNavigo = function(){
        this._initNavigo();
        this._initRoutes();
        this._reinitNavigoHooks();
    }



    p._initNavigo = function () {
        // setup navigo https://github.com/krasimir/navigo (the router doing the real work)
        if(this.navigo) this.navigo.destroy();
        var root    = null;
        var useHash = this._routerUseHash; // Defaults to: false
        var hash    = '#!'; // Defaults to: '#'
        this.navigo = new Navigo(root, useHash, hash);
    }



    /**
     * _initRoutes
     * @param routes
     * @private
     */
    p._initRoutes = function () {
        var self = this;
        var setupRoutes = function( childRoutes, parentRoute ) {
            ko.utils.arrayForEach(childRoutes, function (route) {
                route.parent = parentRoute;
                if(route.url) {
                    self.navigo
                        .on(route.url, function (requestParams) {
                            console.log( "navigo callback", route, requestParams );
                            var p = route.pageparams ? route.pageparams : {};
                            var r = _.isObject(requestParams) ? ko.utils.extend(requestParams, p) : p;

                            if( self.currentRoute() != route && self._checkURLagainstMiddlewear(route.url, r) ) {
                                self.currentRoute( route );
                                self._lastValidRoute = route;
                                self.eventchannel.publish( events.ROUTER_ROUTE_CHANGED , {route:route, pageparams:r} );
                            }
                        })
                        .resolve();

                    if (route.children) setupRoutes(route.children, route);
                }
            });
        }
        setupRoutes(this.routes, null);

        this.navigo.notFound(function () {
            self.navigo.navigate( self.getNotFoundRoute() );
        });
    }


    p._reinitNavigoHooks = function () {
        var self = this;
        var mw = this.middlewares;
        this.navigo.hooks({
            before: function(done, params) {
                var url = self.navigo.lastRouteResolved().url;
                var res = self._checkURLagainstMiddlewear(url);
                done(res);
                if(!res && self._lastValidRoute) self.gotoRoute(self._lastValidRoute);
            }
        });
    }


    p._checkURLagainstMiddlewear = function ( url, requestParams ) {
        var res = true;
        url = _.trimStart(url, '/');
        var route = this.findRoute(url);
        _.forEach( this.middlewares, function( middleware ) {
            res = res && middleware( url, route, requestParams );
        });
        return res;
    }



    Router.getInstance = function () {
        if(!instance) {
            instance = new Router();
        }
        return instance;
    }



    return Router.getInstance();
});

