define([
    'postal',
    "./engineevents",
    'CreateJS/PreloadJS'
], function (postal, events) {

    var _handleLoaderEvent = function( e ) {
        // eventbus
        var eventchannel   = postal.channel( events.CHANNEL_PRELOADER );

        switch(e.type ) {
            case "fileload":
                eventchannel.publish( events.PRELOADER_FILELOAD );
                break;

            case "error":
                eventchannel.publish( events.PRELOADER_ERROR );
                break;

            case "progress":
                eventchannel.publish(events.PRELOADER_PROGRESS, {percentLoaded: e.progress*100});
                break;
        }
    }

    return {
        preloadAssetsManifest: function ( manifest ) {
            var self = this;
            var promise = new Promise( function (resolve, reject) {
                var eventchannel   = postal.channel( events.CHANNEL_PRELOADER );
                eventchannel.publish( events.PRELOADER_START );

                var queue = new createjs.LoadQueue(true);
                queue.on("fileload", _handleLoaderEvent, self);
                queue.on("fileprogress", _handleLoaderEvent, self);
                queue.on("error", _handleLoaderEvent, self);
                queue.on("progress", _handleLoaderEvent, self);
                queue.on("complete", function () {
                    resolve( queue );
                    eventchannel.publish(events.PRELOADER_COMPLETE, {assets:queue} );
                });
                queue.loadManifest(manifest);
            });

            return promise;
        }
    }
});