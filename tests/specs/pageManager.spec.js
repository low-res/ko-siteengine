define([
    "src/core/pageManager"
], function(PageManager) {

  describe('pageManager Tests', function() {


      it('should change to pages specified by id or url', function( done ){
          var routes =  [
              { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
              { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
          ];
          var pm = PageManager;
          pm.init(routes);
          pm.changePageTo('jobs');

          setTimeout(function () {
              console.log( pm.currentPage() );
              expect(pm.currentPage()).toEqual( { name : 'jobs-page', params : {  } } );
              done();
          }, 200);
      });

      it('should be possible to pass additional parameters to page components', function( done ){
          var routes =  [
              { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
              { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
          ];

          var pm = PageManager;

          pm.init(routes);
          pm.changePageTo('timenetries', {additionalParam: 123} );
          var expectedData = { name : 'timeentries-page', params : { additionalParam:123 } };

          setTimeout(function () {
              var cp = pm.currentPage();
              expect(cp.name).toEqual( expectedData.name );
              expect(pm.newPageParams).toEqual( expectedData.params );
              done();
          }, 200);

      });

      it('should change to nested pages specified by id or url', function( done ){
          var childRoute = { id:2, url: 'client/settings/defaults', params: { page: 'jobs-page' } };
          var routes =  [
              { id:5, url: 'client',    params: { page: 'page'    }, children:[
                  { id:3, url: 'client/detail',     params: { page: 'page'    } },
                  { id:4, url: 'client/settings',   params: { page: 'page-settings'    }, children:[
                      childRoute
                  ] }
              ] }
          ];
          var pm = PageManager;
          pm.init(routes);
          pm.changePageTo('client/settings');


          setTimeout(function () {
              expect(pm.currentPage()).toEqual( { name : 'page-settings', params : {  } } );
              done();
          }, 200);
      });

  });

});
