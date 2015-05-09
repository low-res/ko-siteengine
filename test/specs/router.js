define([
    "router"
], function(router) {

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

  });

});
