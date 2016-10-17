define([
    "siteengine/router",
    "crossroads"
], function(router, crossroads) {

  describe('router Tests', function() {

      it('should have empty routes array', function() {
          expect(router.routes).toBeDefined();
          expect(router.routes.length).toEqual(0);
      })

      it('should be possible to set routes', function() {
          var routes =  [
                  { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
                  { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
              ];
          router.setRoutes(routes);
          expect(router.routes.length).toEqual(2);

          expect( crossroads.getNumRoutes()).toEqual(2);
      });

      describe('nested routes', function(){
          var childRoute;

          beforeEach( function(){

              childRoute = { id:2, url: 'client/settings/defaults', params: { page: 'jobs-page' } };
              var routes =  [
                  { id:5, url: 'client',    params: { page: 'page'    }, children:[
                      { id:3, url: 'client/detail',     params: { page: 'page'    } },
                      { id:4, url: 'client/settings',   params: { page: 'page'    }, children:[
                          childRoute
                      ] }
                  ] }
              ];
              router.setRoutes(routes);
          } );

          it('should be possible to have childroutes', function() {
              expect( crossroads.getNumRoutes()).toEqual(4);
          });

          it('should find nested routes', function(){
              var f1 = router.findRoute(5);
              expect(f1.url).toEqual('client');

              var f2 = router.findRoute(2);
              expect(f2.url).toEqual('client/settings/defaults');
          });

          it('should set a reference to the parent route while initing routes', function(){
              var f1 = router.findRoute(5);
              expect(f1.parent).toBeNull();

              var f2 = router.findRoute(2);
              expect(f2.parent.id).toEqual(4);
          });

          it('should calculate the rootline of the current Page', function(){

              router.currentRoute( childRoute );
              var rl = router.rootLine();
              expect(rl.length).toEqual(3);
              expect(rl[0]).toEqual(childRoute);
              expect(rl[1].id).toEqual(4);
              expect(rl[2].id).toEqual(5);
          });
      })



  });

});
