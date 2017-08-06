define([
    'amplify',
    'jquery',
    'CreateJS/PreloadJS'
], function (amplify, $) {

    var _handleLoaderEvent = function( e ){
        switch(e.type ) {
            case "fileload":
                amplify.publish("preloader.fileload");
                break;

            case "error":
                amplify.publish("preloader.error");
                break;

            case "progress":
                amplify.publish("preloader.progress", {percentLoaded: e.progress*100});
                break;
        }
    }

    return {

        preloadAssetsManifest: function ( manifest ) {
            amplify.publish("preloader.start");
            var def = $.Deferred();
            var queue = new createjs.LoadQueue(true);
            queue.on("fileload", _handleLoaderEvent, this);
            queue.on("fileprogress", _handleLoaderEvent, this);
            queue.on("error", _handleLoaderEvent, this);
            queue.on("progress", _handleLoaderEvent, this);
            queue.on("complete", function () {
                def.resolve( queue );
                amplify.publish("preloader.complete", {assets:queue});
            });
            queue.loadManifest(manifest);
            return def.promise();
        }
    }
});