'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function ($scope, fbutil, user, FBURL) {
    $scope.syncedValue = fbutil.syncObject('syncedValue');
    $scope.user = user;
    $scope.FBURL = FBURL;
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
        url: itemPicture
      }
      $scope.items.$add(newItem);
    }
  };
}])

.controller('ListItemsCtrl', ['$scope', 'itemsList', function ($scope, itemsList) {
    $scope.items = itemsList;
}])

.controller('userDetailCtrl', ['$scope', '$routeParams', 'fbutil', 'usersList', function ($scope, $routeParams, fbutil, usersList) {
    var user = fbutil.syncObject(['users', $routeParams.userId]);
    user.$bindTo($scope, 'user');
}])


.controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function ($scope, simpleLogin, $location) {
  $scope.fullname = null;
  $scope.address = null;
  $scope.city = null;
  $scope.state = null;
  $scope.zipcode = null;
  $scope.email = null;
  $scope.pass = null;
  $scope.confirm = null;
  $scope.createMode = false;
  $scope.coordinates = null;

  $scope.login = function (email, pass) {
    $scope.err = null;
    simpleLogin.login(email, pass)
      .then(function ( /* user */ ) {
        $location.path('/account');
      }, function (err) {
        $scope.err = errMessage(err);
      });
  };

  $scope.createAccount = function () {
    $scope.err = null;
    if (assertValidAccountProps()) {
      simpleLogin.createAccount($scope.fullname, $scope.address, $scope.city, $scope.state, $scope.zipcode, $scope.email, $scope.pass)
        .then(function ( /* user */ ) {
          $location.path('/account');
        }, function (err) {
          $scope.err = errMessage(err);
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
    }
  ]);
