'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function ($scope, fbutil, user, FBURL) {
    var user = fbutil.syncObject(['users', user.uid]);
    user.$bindTo($scope, 'user');
  }])

.controller('ItemsCtrl', ['$scope', 'itemsList', 'user', 'fbutil', function ($scope, itemsList, user, fbutil) {
  $scope.items = itemsList;

  var profile = fbutil.syncObject(['users', user.uid]);
  profile.$bindTo($scope, 'profile');

  $scope.addItem = function (itemName, itemDescription, itemPrice, itemPicture) {
    if (itemName && itemDescription && itemPrice) {
      var newItem = {
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        userid: user.uid,
        username: profile.name,
        url: itemPicture,
        ownerPicture: profile.url
      }
      $scope.items.$add(newItem);
    }
  };
}])

.controller('ListItemsCtrl', ['$scope', 'itemsList', 'usersList', 'fbutil', function ($scope, itemsList, usersList, fbutil) {
  itemsList.$loaded( function(data) {
        for (var i = 0; i < data.length; i++) {
            var usrId = data[i].userid;
            data[i].usrObject = fbutil.syncArray(['users', usrId]);
        }
  $scope.items = data;
  });   

  $scope.items = itemsList;
  $scope.usersList = usersList;

    // haversine
    // By Nick Justice (niix)
    // https://github.com/niix/haversine

    // convert to radians
    var toRad = function(num) {
      return num * Math.PI / 180
    };
    function haversine(start, end, options) {
      var km    = 6371
      var mile  = 3960
      options   = options || {}

    var R = options.unit === 'mile' ?
        mile :
        km

    var dLat = toRad(end.latitude - start.latitude)
      var dLon = toRad(end.longitude - start.longitude)
      var lat1 = toRad(start.latitude)
      var lat2 = toRad(end.latitude)

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    if (options.threshold) {
        return options.threshold > (R * c)
      } else {
        return R * c
      }
    };

  $scope.getLocationAndFilter = function (thresh) {
        $scope.items = itemsList;
        navigator.geolocation.getCurrentPosition(function(pos) {
        var coords = {'longitude': pos.coords.longitude,
                      'latitude': pos.coords.latitude};
        $scope.coordinates = coords;

      $scope.userLocations = {};
        for (var i = 0; i < usersList.length; i++) {
          var user = usersList[i];
          $scope.userLocations[user.$id] = user.coordinates;
        }
        $scope.items = $scope.items.filter(function(item) {
          var retVal = haversine($scope.userLocations[item.userid], coords, {unit: 'mile'}) < thresh;
          console.log(item.name + retVal);
          return retVal;
        });
        $scope.$apply();
      });
    }
 }])

.controller('userDetailCtrl', ['$scope', '$routeParams', 'fbutil', 'usersList', '$sce', 'itemsList',
    function ($scope, $routeParams, fbutil, usersList, $sce, itemsList) {

    $scope.items = itemsList;

    var user = fbutil.syncObject(['users', $routeParams.userId]);
    user.$bindTo($scope, 'user');

    $scope.getMapQueryString = function (address, city, state, zipcode) {
      return $sce.trustAsResourceUrl("https://www.google.com/maps/embed/v1/place?key=AIzaSyDqUoEaakiM5voTOBOqWEhCVydQKoWOZ3E&q=" + address + city + state + zipcode);
    }
}])

.controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function ($scope, simpleLogin, $location) {
  $scope.email = null;
  $scope.pass = null;
  $scope.confirm = null;
  $scope.createMode = false;


  $scope.login = function (email, pass) {
    $scope.err = null;
    simpleLogin.login(email, pass)
      .then(function ( /* user */ ) {
        $location.path('/account');
      }, function (err) {
        $scope.err = errMessage(err);
      });
  };

  function errMessage(err) {
    return angular.isObject(err) && err.code ? err.code : err + '';
  }
}])
.controller('RegisterCtrl', ['$scope', 'simpleLogin', '$location', function ($scope, simpleLogin, $location) {
  $scope.fullname = null;
  $scope.url = null;
  $scope.address = null;
  $scope.city = null;
  $scope.state = null;
  $scope.zipcode = null;
  $scope.email = null;
  $scope.pass = null;
  $scope.confirm = null;
  $scope.createMode = false;


  $scope.createAccount = function () {
    $scope.err = null;
    if (assertValidAccountProps()) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        var coords = {'longitude': pos.coords.longitude,
                      'latitude': pos.coords.latitude};
        console.log("we got here, so yeah.");
        simpleLogin.createAccount($scope.fullname, $scope.url, $scope.coverPhotoUrl, $scope.address, $scope.city, $scope.state, $scope.zipcode, $scope.email, $scope.pass, coords)
        .then(function (user) {
          $location.path('/account');
        }, function (err) {
          $scope.err = errMessage(err);
        });

      });


    }
  };

  function assertValidAccountProps() {
    if (!$scope.fullname) {
      $scope.err = 'Please enter your full name';
    } else if (!$scope.address) {
      $scope.err = 'Please enter an address';
    } else if (!$scope.city) {
      $scope.err = 'Please enter the city';
    } else if (!$scope.state) {
      $scope.err = 'Please enter the state';
    } else if (!$scope.zipcode) {
      $scope.err = 'Please enter the zipcode';
    } else if (!$scope.email) {
      $scope.err = 'Please enter an email address';
    } else if (!$scope.pass || !$scope.confirm) {
      $scope.err = 'Please enter a password';
    } else if ($scope.createMode && $scope.pass !== $scope.confirm) {
      $scope.err = 'Passwords do not match';
    }
    return !$scope.err;
  }

  function errMessage(err) {
    return angular.isObject(err) && err.code ? err.code : err + '';
  }
}])

.controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location',
    function ($scope, simpleLogin, fbutil, user, $location) {
    // create a 3-way binding with the user profile object in Firebase
    var profile = fbutil.syncObject(['users', user.uid]);
    profile.$bindTo($scope, 'profile');

    // expose logout function to scope
    $scope.logout = function () {
      profile.$destroy();
      simpleLogin.logout();
      $location.path('/login');
    };

    $scope.changeInfo = function (name, address, city, zip, state) {
        // TODO: update user information
    };

    $scope.changePassword = function (pass, confirm, newPass) {
      resetMessages();
      if (!pass || !confirm || !newPass) {
        $scope.err = 'Please fill in all password fields';
      } else if (newPass !== confirm) {
        $scope.err = 'New pass and confirm do not match';
      } else {
        simpleLogin.changePassword(profile.email, pass, newPass)
          .then(function () {
            $scope.msg = 'Password changed';
          }, function (err) {
            $scope.err = err;
          })
      }
    };

    $scope.clear = resetMessages;

    $scope.changeEmail = function (pass, newEmail) {
      resetMessages();
      var oldEmail = profile.email;
      profile.$destroy();
      simpleLogin.changeEmail(pass, oldEmail, newEmail)
        .then(function (user) {
          profile = fbutil.syncObject(['users', user.uid]);
          profile.$bindTo($scope, 'profile');
          $scope.emailmsg = 'Email changed';
        }, function (err) {
          $scope.emailerr = err;
        });
    };

    function resetMessages() {
      $scope.err = null;
      $scope.msg = null;
      $scope.emailerr = null;
      $scope.emailmsg = null;
    }

    $scope.updateLocation = function () {
      resetMessages();
      navigator.geolocation.getCurrentPosition(function(pos) {
        var coords = {'longitude': pos.coords.longitude,
                      'latitude': pos.coords.latitude};
        var profile = fbutil.syncObject(['users', user.uid]);
        profile.coordinates = coords;
        profile.$save().then(function(ref) {
          $scope.msg = "Location updated: long:" + coords.longitude + ", lat:" + coords.latitude;
        }, function(error) {
          console.log("Error:", error);
        });

      });
    }
    }
  ]);
