'use strict';

angular.module('app', ['ngMaterial', 'ngclipboard']).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('blue-grey')
  .accentPalette('blue');
})
.controller('todoCtrl', function ($scope, vsoRepository) {




  var d = new Date();
  $scope.dateMinusSix = d.getDate() - 6;
  $scope.dateMinusFive = d.getDate() - 5;
  $scope.dateMinusFour = d.getDate() - 4;
  $scope.dateMinusThree = d.getDate() - 3;
  $scope.dateMinusTwo = d.getDate() - 2;
  $scope.dateMinusOne = d.getDate() - 1;
  $scope.dateMinusZero = d.getDate();
  var selectedDate = new Date();
  $scope.isLoadingBacklog = true;
  $scope.isLoadingPR = true;
  $scope.onlyShowForStatusChanges = true;
  $scope.webRequestPullRequestFailed = false;
  $scope.webRequestBacklogFailed = false;
  $scope.showSettings = false;
  $scope.settingsText = "Show Settings";
  $scope.personalAccessToken = "chusz3qyhkd5ravemieglglavuqkltcfmfan7lmcc77ajzmvhh5a";

  $scope.vsoRepository = vsoRepository;

  $scope.pullRequests = [];
  $scope.webRequestPullRequestFailed = false;
  var getPullRequests = function(){
    $scope.isLoadingPR = true;
    $scope.vsoRepository.getPullRequests($scope.personalaccesstoken).then(function(data){
      if(data === [] || data === undefined || data === null){
        $scope.webRequestPullRequestFailed = true;
      }
      var pullRequestsOnDate = [];
      for(var i = 0 ; i < data.length; i++){
        var pullRequestDate = new Date(data[i].creationDate);
        if(selectedDate.getFullYear() === pullRequestDate.getFullYear() &&
        selectedDate.getMonth() === pullRequestDate.getMonth() &&
        selectedDate.getDate() === pullRequestDate.getDate()) {
          pullRequestsOnDate.push(data[i]);
        }
      }
      $scope.pullRequests = pullRequestsOnDate;
    }).finally(function(){
      $scope.isLoadingPR = false;
    });
  }


  var retrieveBacklogItems = function() {

    chrome.storage.local.set({ "backlogItemsAge": '2017/01/01' }, function(){ });

      chrome.storage.local.get(["backlogItemsAge"], function(data){

      // if(data === undefined || data === null){
      //   $scope.downloadBacklogItems();
      //   return;
      //
      // }

      alert(''+JSON.stringify(data));
      var age = new Date(data.backlogItemsAge);

      if(isNaN( age.getTime() )){
          alert('downloading cuz of invalid date');
          $scope.downloadBacklogItems();
          return;
      }

      var oneHourAgo = new Date();
       oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      alert(age +'<' + oneHourAgo.toString());
      if(age > oneHourAgo){
        alert('Fetch from storage');
        chrome.storage.local.get(/* String or Array */["backlogItems"], function(items){
          if(items != {} && items != undefined && items != null){
            $scope.backlogItems = items.backlogItems;
            $scope.isLoadingBacklog= false;
            alert('Fetched from storage');
          }
        });
      }else{
        alert('downloading');
        $scope.downloadBacklogItems();
      }
    });
  }

  $scope.downloadBacklogItems = function(){
    var now = new Date(); //"now"
    var daysAgo = Math.floor((now-selectedDate)/(1000*60*60*24));
    $scope.backlogItems = [];
    $scope.isLoadingBacklog = true;
    $scope.webRequestBacklogFailed = false;
      alert('2');
    $scope.vsoRepository.getBacklogChanges(daysAgo, $scope.onlyShowForStatusChanges, $scope.personalAccessToken).then(function(data) {
      alert('3');
      if(data === [] || data === undefined || data === null){
        $scope.webRequestBacklogFailed = true;
      }
        alert('4');
      $scope.backlogItems = data;
    //  var dateNow = new Date().toString();
    //  chrome.storage.local.set({ "backlogItemsAge": dateNow }, function(){ });

    }).finally(function(){
      alert('fails');
      $scope.isLoadingBacklog= false;
    });
  }

  $scope.refreshPage = function(){


    getPullRequests();
    retrieveBacklogItems();
  }

  $scope.changeDate = function(day){
    var d = new Date();
    selectedDate = new Date(d.setDate(d.getDate() - day));
    getPullRequests();
    retrieveBacklogItems();
  }


  $scope.toggleSettingsVisibility = function(){
    if(!$scope.showSettings){
      $scope.settingsText = "Show Dashboard";
      $scope.showSettings = true;
    }else{
      $scope.settingsText = "Show Settings";
      $scope.showSettings = false;
    }
  }





  getPullRequests();
  retrieveBacklogItems();
});
