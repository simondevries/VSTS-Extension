'use strict';

angular.module("app", [])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark();
});
