define([
    "src/core/router",
], function(router) {

  describe('router Tests', function() {
      var childRoute;



      it('should have empty routes array', function() {
          expect(router.routes).toBeDefined();
          expect(router.routes.length).toEqual(0);
      });



      describe('normal behaviour', function() {
          beforeEach( function(){
              childRoute = { id:2, url: 'client/settings/defaults', params: { page: 'jobs-page' } };
              var routes =  [
                  { id:3, url: 'detail', params: { page: 'page'    } },
                  { id:5, url: 'client',        params: { page: 'page'    } }
              ];
              router.setRoutes(routes);
          } );

          it('should be possible to set routes', function() {
              var routes =  [
                  { id:1, url: 'timenetries',   params: { page: 'timeentries-page'    } },
                  { id:2, url: 'jobs',          params: { page: 'jobs-page'           } }
              ];
              router.setRoutes(routes);
              expect(router.routes.length).toEqual(2);
          });

          it('should change the browser location when going to a page', function () {
              var basePath = location.href;
              console.log( basePath );
              router.gotoPage(3);
              var loc1 = location.href;
              var test1 = loc1.endsWith('detail');
              expect(test1).toBeTruthy("location.href "+loc1+ " should end with /client/detail ");

              router.gotoPage("client");
              var loc2 = location.href;
              var test2 = loc2.endsWith('client');
              expect(test2).toBeTruthy();
          });



      });



      describe('filtering routes', function(){

          it('should be possible to add middlewares to controll the change of routes', function( done ){
                var routes = [
                    { id:1, url:'allowed', params:{page:'' }},
                    { id:2, url:'forbidden', params:{page:''} }
                ];

                router.setRoutes(routes);

                var middleware = router.addMiddleware( function( url, route ) {
                  console.log( "params", url, route );
                  if(url == "forbidden") return false;
                  else return true;
                });

                router.gotoPage("allowed");
                var loc = location.href;
                console.log( loc );
                var test = loc.endsWith('allowed');
                expect(test).toBeTruthy();

                setTimeout(function () {
                    router.gotoPage("forbidden");
                    setTimeout(function () {
                        var loc1 = location.href;
                        var test1 = loc1.endsWith('allowed');
                        expect(test1).toBeTruthy();
                    }, 200);

                }, 500);

              setTimeout(function () {
                  router.removeMiddleware(middleware);
                  router.gotoPage("forbidden");
                  setTimeout(function () {
                      var loc2 = location.href;
                      console.log( loc2 );
                      var test2 = loc2.endsWith('forbidden');
                      expect(test2).toBeTruthy();
                      done();
                  }, 200);

              }, 1500);
          });

      });



      describe('nested routes', function(){
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

      });

  });
});
