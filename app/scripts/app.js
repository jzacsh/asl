'use strict';

angular.module('spellApp', [
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).
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
