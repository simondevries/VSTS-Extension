'use strict';

angular.module('app').controller('todoCtrl', function ($scope, vsoRepository) {

    $scope.vsoRepository = vsoRepository;

    $scope.$watch('vsoRepository.data', function() {
      $scope.todoList = null;
    });

    $scope.vsoRepository.findAll(function(data){



    }).then(function(data) {
      // var images = document.getElementById('mainContentAlignment');
      // for (var i = 0, l = images.length; i < l; i++) {
      //   images[i].src = 'http://placekitten.com/' + images[i].width + '/' + images[i].height;
      // }

        $scope.todoList = data;
    });
  });
