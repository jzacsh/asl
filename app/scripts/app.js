'use strict';

angular.module('spellApp', []).
    config(function($routeProvider) {
      $routeProvider.
        when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        }).
        otherwise({
          redirectTo: '/'
        });
    });
