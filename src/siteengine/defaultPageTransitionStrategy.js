define([
    "knockout",
    "jquery",
    "velocity",
    "preloader"
],  function(ko, $, velocity, preloader) {

    var p = DefaultPageTransitionStrategy.prototype;
    var self = this;

    /**
     * DefaultPageTransitionStrategy
     *
     * @constructor
     */
    function DefaultPageTransitionStrategy( pageComponentDefinition ) {
        this.pageComponentDefinition    = pageComponentDefinition; // observable, that triggers the view to show the containing component-definition

        this.currentPageVmInstance      = null; // hold a reference to the current pages viewModel
        this.componentNameNewPage       = null; // name of the new page component
        this.newPageVmInstance          = null; // hold a reference to the next page viewModel
        this.newPageUrl                 = "";

        this.pageViewModels             = {};
    }


    /**
     * handlePageChange
     * @param {object} newRoute
     */
    p.handlePageChange = function( newRouteParams, url ) {
        var self = this;
        var componentName = newRouteParams.page;
        this.newPageUrl = url;

        // first check if we have this view model already created
        if( this.pageViewModels[url] ) {
            this.newPageVmInstance = this.pageViewModels[url];
            this.componentNameNewPage = componentName;
            this._doPageTransition();
        } else {
            // otherwise instantiate component viwemodel
            if( ko.components.isRegistered(componentName) ) {
                self._processPageChange(componentName);
            } else {
                self._dummyTransition(componentName);
            }
        }


    }


    /**
     * _processPageChange
     * @param componentNameNewPage
     * @private
     */
    p._processPageChange = function(componentNameNewPage) {
        var self = this;
        ko.components.get(componentNameNewPage, function( componentDefinition ){
            if( componentDefinition.createViewModel ) {
                var newPageInstance = componentDefinition.createViewModel( {} );
                self.newPageVmInstance = newPageInstance;
                self.componentNameNewPage = componentNameNewPage;
                self.pageViewModels[self.newPageUrl] = newPageInstance;
                self._doPageTransition();
            } else {
                self._dummyTransition(componentNameNewPage);
            }
        })
    }


    /**
     * _doPageTransition
     * @param newPageInstance
     * @private
     */
    p._doPageTransition = function( ) {
        //console.log( "do Transition "+componentNameNewPage );
        var self = this;

        this.hideAnimation()
            .then( $.proxy( this.appendNewPage, this ) )
            .then( $.proxy( this.preloadAssets, this ) )
            .then( $.proxy( this.applyLoadedAssets, this ) )
            .then( $.proxy( this.showAnimation, this ) );
    }



    ////////////////////////////////////////////

    //  PAGE TRANSITION STEPS

    ////////////////////////////////////////////

    p.hideAnimation = function() {
        var oldPageInstance = this.currentPageVmInstance;
        var p1 = $.Deferred().resolve().promise();
        if( oldPageInstance && oldPageInstance.hideAnimation ) p1 = oldPageInstance.hideAnimation();
        return p1;
    }


    p.appendNewPage = function( ) {
        var pageSettings = {
            name: this.componentNameNewPage,
            params: {instance: this.newPageVmInstance }
        }
        this.currentPageVmInstance = this.newPageVmInstance;
        this.newPageVmInstance = null;
        this.pageComponentDefinition( pageSettings );

        // Fake delay, just a test
        // we need to wait just a moment until the new page component is available in dom
        var def = $.Deferred();
        setTimeout(function() {
            def.resolve();
        }, 100);

        return def.promise();
    }


    p.preloadAssets = function() {
        var cPVI = this.currentPageVmInstance;
        if( cPVI.getPreloadAssetsManifest && cPVI.getPreloadAssetsManifest().length > 0 ) {
            return preloader.preloadAssetsManifest( cPVI.getPreloadAssetsManifest() );
        } else {
            return $.Deferred().resolve().promise();
        }
    }


    p.applyLoadedAssets = function( assets ) {
        var p = $.Deferred().resolve().promise();
        var cPVI = this.currentPageVmInstance;
        if( cPVI.applyLoadedAssets ) p = cPVI.applyLoadedAssets( assets );
        return p;
    }


    p.showAnimation = function(  ) {
        var p2 = $.Deferred().resolve().promise();
        var cPVI = this.currentPageVmInstance;
        if( cPVI.showAnimation ) p2 = cPVI.showAnimation( );
        return p2;
    }


    /**
     * _dummyTransition
     * @param componentNameNewPage
     * @private
     */
    p._dummyTransition = function(componentNameNewPage) {
        var pageSettings = {
            name: componentNameNewPage,
            params: { }
        }
        this.pageComponentDefinition( pageSettings );
    }


    return DefaultPageTransitionStrategy;

});