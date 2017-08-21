define([
    'knockout',
    './example-page.html!text'
], function(ko, templateMarkup){

    var p = ExamplePage.prototype;

    function ExamplePage( params ) {
        this.params = JSON.stringify(params);
    }

    /**
     *
     * @returns {Promise}
     */
    p.showAnimation = function(){
        return Promise.resolve();
    }



    /**
     *
     * @returns {Promise}
     */
    p.hideAnimation = function(){
        return Promise.resolve();
    }


    /**
     * returns JS-Array for preloadJS with all assets that
     * need to be loaded before page is shown
     */
    p.getPreloadAssetsManifest = function(){
        return [
            {id:"myImage", src:"assets/WB_Logo.svg"}
        ];
    }


    p.applyLoadedAssets = function ( assets ) {
        console.log( "applyLoadedAssets", assets );
        return Promise.resolve();
    }


    return {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                return new ExamplePage(params);
            }
        },
        template: templateMarkup
    }

});