'use strict';

angular.module('app', ['ngMaterial', 'ngclipboard']).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue-grey')
  .accentPalette('blue');
})
.controller('todoCtrl', function ($scope, vsoRepository) {
  var selectedDate = new Date();
  $scope.isLoadingBacklog = true;
  $scope.isLoadingPR = true;
  $scope.webRequestPullRequestFailed = false;
  $scope.webRequestBacklogFailed = false;
  $scope.showSettings = false;
  $scope.settingsText = "Show Settings";
  $scope.obg = {};
  $scope.obg.onlyShowForStatusChanges = true;
  $scope.obg.personalAccessToken = '';
  $scope.obg.selectedAccount = '';
  $scope.obg.selectedProject = '';
  $scope.accounts = [];
  $scope.projects = [];


  $scope.vsoRepository = vsoRepository;


  $scope.pullRequests = [];
  $scope.webRequestPullRequestFailed = false;


    chrome.storage.local.get(["obg"], function(data){
      $scope.obg = data.obg;
    });



  var getPullRequests = function(){
    $scope.isLoadingPR = true;
    chrome.storage.local.get(["prItemsAge"], function(data){
      chrome.storage.local.set({ "prItemsAge": data.prItemsAge }, function(){
        chrome.storage.local.get(["prItemsAge"], function(data){

          if(data === undefined || data === null || data.prItemsAge === undefined || data.prItemsAge === null){
            $scope.downloadPullRequests();
            return;
          }

          var age = new Date(data.prItemsAge);
          var oneHoursAge = new Date();
          oneHoursAge = oneHoursAge.setHours(oneHoursAge.getHours() - 1);
          if(age > oneHoursAge){
            chrome.storage.local.get(["prItems"], function(items){
              if(items != {} && items != undefined && items != null){
                $scope.pullRequests = items.prItems;
                $scope.isLoadingPR = false;
              }
            });
          }else{
            $scope.downloadPullRequests();
          }
        });
      });
    });
  }

  $scope.downloadPullRequests = function(){
    $scope.isLoadingPR = true;
    $scope.vsoRepository.getPullRequests($scope.obg.personalaccesstoken, $scope.obg.selectedAccount, $scope.obg.selectedProject).then(function(data){
      if(data === [] || data === undefined || data === null){
        $scope.webRequestPullRequestFailed = true;
      }
      var pullRequestsOnDate = [];
      for(var i = 0 ; i < data.length; i++){
        var pullRequestDate = new Date(data[i].creationDate);
        if(selectedDate.getFullYear() === pullRequestDate.getFullYear() &&
        selectedDate.getMonth() === pullRequestDate.getMonth() &&
        selectedDate.getDate() === pullRequestDate.getDate()) {
          data[i].selected = false;
          pullRequestsOnDate.push(data[i]);
        }
      }
      chrome.storage.local.set({ "prItems": pullRequestsOnDate }, function(){});
      var age = new Date().toString();
      chrome.storage.local.set({ "prItemsAge": age }, function(){  });
      $scope.pullRequests = pullRequestsOnDate;
    }).finally(function(){
      $scope.isLoadingPR = false;
    });
  }

  $scope.retrieveBacklogItems = function() {
    $scope.isLoadingBacklog = true;
    chrome.storage.local.get(["backlogItemsAge"], function(data){
      chrome.storage.local.set({ "backlogItemsAge": data.backlogItemsAge }, function(){
        chrome.storage.local.get(["backlogItemsAge"], function(data){

          if(data === undefined || data === null || data.backlogItemsAge === undefined || data.backlogItemsAge === null){
            $scope.downloadBacklogItems();
            return;
          }

          var age = new Date(data.backlogItemsAge);
          var oneHoursAge = new Date();
          oneHoursAge = oneHoursAge.setHours(oneHoursAge.getHours() - 1);
          if(age > oneHoursAge){
            chrome.storage.local.get(/* String or Array */["backlogItems"], function(items){
              if(items != {} && items != undefined && items != null){
                $scope.backlogItems = items.backlogItems;
                $scope.isLoadingBacklog= false;
              }
            });
          }else{
            $scope.downloadBacklogItems();
          }
        });
      });
    });
  }

  $scope.downloadBacklogItems = function(){
    var now = new Date(); //"now"
    var daysAgo = Math.floor((now-selectedDate)/(1000*60*60*24));
    $scope.backlogItems = [];
    $scope.isLoadingBacklog = true;
    $scope.webRequestBacklogFailed = false;
    $scope.vsoRepository.getBacklogChanges(daysAgo, $scope.obg.onlyShowForStatusChanges, $scope.obg.personalAccessToken, $scope.obg.selectedAccount, $scope.obg.selectedProject).then(function(data) {

      if(data === [] || data === undefined || data === null){
        $scope.webRequestBacklogFailed = true;
      }
      $scope.backlogItems = data;
      var age = new Date().toString();
      chrome.storage.local.set({ "backlogItemsAge": age }, function(){   });
      chrome.storage.local.set({ "backlogItems": data }, function(){});

    }).finally(function(){
      $scope.isLoadingBacklog= false;
    });
  }

  $scope.refreshPage = function(){
    $scope.downloadPullRequests();
    $scope.downloadBacklogItems();
  }

  $scope.changeDate = function(day){
    var d = new Date();
    selectedDate = new Date(d.setDate(d.getDate() - day));
    $scope.refreshPage();
  }


  $scope.toggleSettingsVisibility = function(){
    if(!$scope.showSettings){
      $scope.vsoRepository.getAccounts($scope.obg.personalAccessToken).then( function(results){
        $scope.accounts = results;

          $scope.vsoRepository.getProjects($scope.obg.personalAccessToken, $scope.obg.selectedAccount).then(function(results){
              $scope.projects = results;
          });
      });
      $scope.settingsText = "Show Dashboard";
      $scope.showSettings = true;
    }else{
      $scope.settingsText = "Show Settings";
      $scope.showSettings = false;
    }
  }

  $scope.isFeature = function(type){
    if(type === 'Feature' || type === 'User Story'){
      return true;
    }
    return false;
  }

  $scope.isEpic = function(type){
    if(type === 'Epic'){
      return true;
    }
    return false;
  }

  $scope.isTask = function(type){
    if(type === 'Task'){
      return true;
    }
    return false;
  }
// Repeat for projectSelected
  $scope.accountSelected = function() {
    $scope.vsoRepository.getProjects($scope.obg.personalAccessToken, $scope.obg.selectedAccount).then(function(results){
      $scope.projects = results;
      $scope.saveObg();
    });
  }


  $scope.shouldShowPullRequests = function(){
      return ($scope.pullRequests && $scope.pullRequests.length) !== 0 || $scope.isLoadingPR;
  }


    $scope.shouldShowBacklog = function(){
        return ($scope.backlogItems && $scope.backlogItems.length) !== 0 || $scope.isLoadingBacklog;
    }

    $scope.saveObg = function() {
      chrome.storage.local.get(["obg"], function(data){
        chrome.storage.local.set({ "obg": data.obg }, function(){
          chrome.storage.local.get(["obg"], function(data){
            chrome.storage.local.set({ "obg": $scope.obg }, function(){});
          });
        });
      });
    }

    $scope.dayOfWeekConvertor = function(day){
        switch (day){
          case 0:
        return "Sunday"
          case 1:
        return "Monday"
          case 2:
        return "Tuesday"
          case 3:
        return "Wednesday"
          case 4:
        return "Thursday"
          case 5:
        return "Friday"
          case 6:
        return "Saturday"
        }
        return "";
    }

      var six = new Date();
      six.setDate(six.getDate() -7 )
      $scope.dateMinusSix = $scope.dayOfWeekConvertor(six.getDay());
      $scope.dateMinusFive = $scope.dayOfWeekConvertor(new Date().setDate(new Date().getDate() - 5).getDay());
      $scope.dateMinusFour = $scope.dayOfWeekConvertor(new Date().setDate(new Date().getDate() - 4).getDay());
      $scope.dateMinusThree = $scope.dayOfWeekConvertor(new Date().setDate(new Date().getDate() - 3).getDay());
      $scope.dateMinusTwo = $scope.dayOfWeekConvertor(new Date().setDate(new Date().getDate() - 2).getDay());
      $scope.dateMinusOne =$scope.dayOfWeekConvertor(new Date().setDate(new Date().getDate() - 1).getDay());
      $scope.dateMinusZero = $scope.dayOfWeekConvertor(new Date().getDay());

  getPullRequests();
  $scope.retrieveBacklogItems();
});
