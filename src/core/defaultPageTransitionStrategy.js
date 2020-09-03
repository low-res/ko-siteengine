define([
    "knockout",
    "lodash",
    "./preloader"
],  function(ko, _, preloader) {

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
        this.newPageVmParams            = null;
        this.newPageUrl                 = "";

        this.pageViewModels             = {};
    }


    /**
     * handlePageChange
     * @param {object} newRoute
     */
    p.handlePageChange = function(newRouteParams, url, additionalPageParams ) {
        console.log( "transition", arguments );
        var self = this;
        var componentName       = newRouteParams.page;
        this.newPageUrl         = url;
        this.newPageVmParams    = additionalPageParams;

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
        ko.components.get(componentNameNewPage, function( componentDefinition ) {
            if( componentDefinition.createViewModel ) {
                var newPageInstance = componentDefinition.createViewModel( self.newPageVmParams );
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
            .then( _.bind( this.appendNewPage, this ) )
            .then( _.bind( this.preloadAssets, this ) )
            .then( _.bind( this.applyLoadedAssets, this ) )
            .then( _.bind( this.showAnimation, this ) );
    }



    ////////////////////////////////////////////

    //  PAGE TRANSITION STEPS

    ////////////////////////////////////////////

    p.hideAnimation = function() {
        var oldPageInstance = this.currentPageVmInstance;
        var p1 = Promise.resolve();
        if( oldPageInstance && oldPageInstance.hideAnimation ){
            p1 = oldPageInstance.hideAnimation();  
        } 
        return p1;
    }


    p.appendNewPage = function( ) {
        var pageSettings            = this._generatePageSettings(this.componentNameNewPage, this.newPageVmInstance);
        this.currentPageVmInstance  = this.newPageVmInstance;
        this.newPageVmInstance      = null;
        this.pageComponentDefinition( pageSettings );

        // Fake delay, just a test
        // we need to wait just a moment until the new page component is available in dom
        var promise = new Promise( function(resolve, reject){
            setTimeout(function() {
                resolve();
            }, 100);
        });
        return promise;
    }


    p.preloadAssets = function() {
        var cPVI = this.currentPageVmInstance;
        if( cPVI && cPVI.getPreloadAssetsManifest && cPVI.getPreloadAssetsManifest().length > 0 ) {
            return preloader.preloadAssetsManifest( cPVI.getPreloadAssetsManifest() );
        } else {
            return Promise.resolve();
        }
    }


    p.applyLoadedAssets = function( assets ) {
        var p = Promise.resolve();
        var cPVI = this.currentPageVmInstance;
        if( cPVI && cPVI.applyLoadedAssets ) p = cPVI.applyLoadedAssets( assets );
        return p;
    }


    p.showAnimation = function(  ) {
        var p2 = Promise.resolve();
        var cPVI = this.currentPageVmInstance;
        if( cPVI && cPVI.showAnimation ) p2 = cPVI.showAnimation( );
        return p2;
    }


    /**
     * _dummyTransition
     * @param componentNameNewPage
     * @private
     */
    p._dummyTransition = function(componentNameNewPage) {
        var pageSettings = this._generatePageSettings(componentNameNewPage);
        this.pageComponentDefinition( pageSettings );
    }


    p._generatePageSettings = function( compName, vmInstance ){
        var o = {}
        o.name = compName;
        o.params = this.newPageVmParams ? this.newPageVmParams : {};
        if(vmInstance) o.params.instance = vmInstance;
        return o;
    };


    return DefaultPageTransitionStrategy;

});