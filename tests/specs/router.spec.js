define([
    "src/core/router",
    "millermedeiros/crossroads"
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

          it('should change the browser location when going to a page', function () {
              var basePath = location.href;
              console.log( basePath );
              router.gotoPage(3);
              var loc1 = location.href;
              var test1 = loc1.endsWith('client/detail');
              expect(test1).toBeTruthy("location.href "+loc1+ " should end with /client/detail ");

              router.gotoPage("client/settings/defaults");
              var loc2 = location.href;
              var test2 = loc2.endsWith('client/settings/defaults');
              expect(test2).toBeTruthy();
          });

          it('should change url to given route', function( done ){
              var routes = router.getRoutes();
              var targetRoute = routes[0].children[1];
              router.gotoRoute( targetRoute );
              setTimeout( function(){
                  console.log( "targetRoute", targetRoute );
                  console.log( "currentRoute", router.currentRoute() );
                  expect(router.currentRoute()).toEqual(targetRoute);
                  done();
              }, 200);

          });
      })
  });
});
