// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        amplify:        "bower_components/amplify/lib/amplify",
        crossroads:     "bower_components/crossroads/dist/crossroads",
        hasher:         "bower_components/hasher/dist/js/hasher",
        jquery:         "bower_components/jquery/dist/jquery",
        knockout:       "bower_components/knockout/dist/knockout",
        lodash:         "bower_components/lodash/lodash",
        requirejs:      "bower_components/requirejs/require",
        "requirejs-text": "bower_components/requirejs-text/text",
        velocity:       "bower_components/velocity/velocity",
        "velocity.ui":  "bower_components/velocity/velocity.ui",
        "signals":      "bower_components/js-signals/dist/signals",
        "preloadjs":    "bower_components/PreloadJS/lib/preloadjs-0.4.0.min",

        "pagemanager":      "siteengine/pageManager",
        "router":           "siteengine/router",
        "pagetransition":   "siteengine/defaultPageTransitionStrategy",
        "preloader":        "siteengine/preloader",
    },
    shim: {
        velocity: {
            deps: [
                "jquery"
            ]
        },
        amplify: {
            deps: [
                "jquery"
            ],
            exports: "amplify"
        }
    },
    packages: [

    ]
};
