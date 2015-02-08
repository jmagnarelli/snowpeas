(function () {
    'use strict';

    /* Services */

    angular.module('myApp.services', [])

    // put your services here!
    // .service('serviceName', ['dependency', function(dependency) {}]);

    .factory('itemsList', ['fbutil', function (fbutil) {
        return fbutil.syncArray('items', {
            limit:100,
            endAt: null
        });
    }])

    .factory('usersList', ['fbutil', function (fbutil) {
        return fbutil.syncArray('users', {
            limit:100,
            endAt: null
        });
    }]);

})();
