define([
    "pageManager"
], function(PageManager) {

  describe('pageManager Tests', function() {

      it('should run', function() {
          var pm = new PageManager();
          expect(true).toBeTruthy();
      });

      it('should change to gages specified by id or url', function(){
          var routes =  [
              { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
              { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
          ];
          var pm = new PageManager();
          pm.init(routes);
          pm.changePageTo('jobs');
          expect(pm.currentPage()).toEqual( { name : 'jobs-page', params : {  } } );

      });

      iit('should be possible to pass additional parameters to page components', function(){
          var routes =  [
              { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
              { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
          ];

          var pm = new PageManager();
          spyOn(pm, "changePageTo").and.callFake(function( param1, param2 ) {
              pm.newPageParams = param2;
              pm.handlePageChange( {page:'timenetries-page'}, param1 );
          });

          pm.init(routes);
          pm.changePageTo('timenetries', {additionalParam: 123} );
          expect(pm.currentPage()).toEqual( { name : 'timenetries-page', params : { additionalParam:123 } } );
      });

  });

});
