define([
    "knockout",
    "./components/navigation/navigation",
    "./components/pagecontainer/pagecontainer"
], function ( ko, navigation, pagecontainer ) {

    if( !ko.components.isRegistered( "navigation" ) ) ko.components.register("navigation",          navigation);
    if( !ko.components.isRegistered( "pagecontainer" ) ) ko.components.register("pagecontainer",    pagecontainer);

});