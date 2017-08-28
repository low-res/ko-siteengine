define([
    'jquery',
    'knockout',
    'low-res/ko-systemjsloader'
], function($,ko) {

    ko.components.register("example-page",  {systemjs: "/src/components/example-page/example-page"});

    $(document).ready(function(){
        console.log( "doc ready. GO!" );

        // Start the App
        var vm = {
            routes : [
                { id:1, url:'page1', params: { page: 'example-page' }, pageparams: { value1:"This is page1"} },
                { id:2, url:'page2', params: { page: 'example-page' }, pageparams: { value1:"This is page2"} }
            ]
        };
        ko.applyBindings( vm );
    });

    // window needs to know knockout (just for chrome knockout debugger plugin)
    window.ko = ko;
});
