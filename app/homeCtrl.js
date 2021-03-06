﻿'use strict';

angular.module('app', ['ngMaterial', 'ngclipboard', 'angularMoment']).config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue');
})
.controller('homeCtrl', function ($scope, vsoRepository) {

    var selectedDate = new Date();
    $scope.temporaryToken = {};
    $scope.temporaryToken.value = '';
    $scope.isLoadingBacklog = true;
    $scope.showReEnterTokenButton = false;
    $scope.isLoadingPR = true;
    $scope.tokenSet = false;
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
    $scope.selectedTab = 0;

    $scope.toggleShowReEnterTokenButton = function () {
        $scope.showReEnterTokenButton = false;
    }

    $scope.getDatePrint = function (number) {
        var date = new Date();
        date.setDate(new Date().getDate() - number);
        return moment(date).format('ddd');
    }

    $scope.dateMinusSix = $scope.getDatePrint(6);
    $scope.dateMinusFive = $scope.getDatePrint(5);
    $scope.dateMinusFour = $scope.getDatePrint(4);
    $scope.dateMinusThree = $scope.getDatePrint(3);
    $scope.dateMinusTwo = $scope.getDatePrint(2);
    $scope.dateMinusOne = $scope.getDatePrint(1);
    $scope.dateMinusZero = $scope.getDatePrint(0);

    var getPullRequests = function () {
        $scope.isLoadingPR = true;
        chrome.storage.local.get(["prItemsAge"], function (data) {

            if (data === undefined || data === null || data.prItemsAge === undefined || data.prItemsAge === null) {
                $scope.downloadPullRequests();
                return;
            }

            var age = new Date(data.prItemsAge);
            var oneHoursAge = new Date();
            oneHoursAge = oneHoursAge.setHours(oneHoursAge.getHours() - 1);
            if (age > oneHoursAge) {
                chrome.storage.local.get(["pullRequestItems"], function (items) {
                    if (!_.isEmpty(items) && !_.isEmpty(items.pullRequestItems)) {
                        $scope.pullRequests = items.pullRequestItems;
                        $scope.isLoadingPR = false;


                    }
                });
            } else {
                $scope.downloadPullRequests();
            }
        });
    }

    $scope.empty = function (input) {
        return input === undefined || input === null;
    }

    $scope.downloadPullRequests = function () {
        $scope.isLoadingPR = true;

        if ($scope.empty($scope.obg) || $scope.empty($scope.obg.personalAccessToken) || $scope.empty($scope.obg.selectedAccount) || $scope.empty($scope.obg.selectedProject)) {
            $scope.isLoadingPR = false;
            return;
        }

        $scope.vsoRepository.getPullRequests($scope.obg.personalAccessToken, $scope.obg.selectedAccount, $scope.obg.selectedProject).then(function (data) {
            if (data === [] || data === undefined || data === null) {
                $scope.webRequestPullRequestFailed = true;
            }
            var pullRequestsOnDate = [];
            for (var i = 0 ; i < data.length; i++) {
                var pullRequestDate = new Date(data[i].creationDate);
                if (selectedDate.getFullYear() === pullRequestDate.getFullYear() &&
                selectedDate.getMonth() === pullRequestDate.getMonth() &&
                selectedDate.getDate() === pullRequestDate.getDate()) {
                    data[i].selected = false;
                    pullRequestsOnDate.push(data[i]);
                }
            }
            chrome.storage.local.set({ "pullRequestItems": pullRequestsOnDate }, function () { });
            var age = new Date().toString();
            chrome.storage.local.set({ "prItemsAge": age }, function () { });
            chrome.storage.local.set({ "selectedTab": $scope.selectedTab }, function () { });
            $scope.pullRequests = pullRequestsOnDate;
        }).finally(function () {
            $scope.isLoadingPR = false;
        });
    }

    $scope.retrieveBacklogItems = function () {
        $scope.isLoadingBacklog = true;
        chrome.storage.local.get(["backlogItemsAge"], function (data) {

            if (data === undefined || data === null || data.backlogItemsAge === undefined || data.backlogItemsAge === null) {
                $scope.downloadBacklogItems();
                $scope.isLoadingBacklog = false;
                return;
            }

            var age = new Date(data.backlogItemsAge);
            var oneHoursAge = new Date();
            oneHoursAge = oneHoursAge.setHours(oneHoursAge.getHours() - 1);
            if (age > oneHoursAge) {
                chrome.storage.local.get(["backlogItems"], function (items) {
                    if (items !== {} && items !== undefined && items !== null) {
                        $scope.backlogItems = items.backlogItems;
                        $scope.isLoadingBacklog = false;

                        chrome.storage.local.get(["selectedTab"], function (data) {
                            $scope.selectedTab = data.selectedTab;
                        });
                    }
                });
            } else {
                $scope.downloadBacklogItems();
            }
        });
    }

    $scope.downloadBacklogItems = function () {
        if ($scope.empty($scope.obg) || $scope.empty($scope.obg.onlyShowForStatusChanges) || $scope.empty($scope.obg.personalAccessToken) || $scope.empty($scope.obg.selectedAccount) || $scope.empty($scope.obg.selectedProject)) {
            return;
        }

        var now = new Date(); //"now"
        var daysAgo = Math.floor((now - selectedDate) / (1000 * 60 * 60 * 24));
        $scope.backlogItems = [];
        $scope.isLoadingBacklog = true;
        $scope.webRequestBacklogFailed = false;
        $scope.vsoRepository.getBacklogChanges(daysAgo, $scope.obg.onlyShowForStatusChanges, $scope.obg.personalAccessToken, $scope.obg.selectedAccount, $scope.obg.selectedProject).then(function (data) {

            if (data === [] || data === undefined || data === null) {
                $scope.webRequestBacklogFailed = true;
            }
            $scope.backlogItems = data;
            var age = new Date().toString();
            chrome.storage.local.set({ "backlogItemsAge": age }, function () { });
            chrome.storage.local.set({ "backlogItems": data }, function () { });
            chrome.storage.local.set({ "selectedTab": $scope.selectedTab }, function () { });

        }).finally(function () {
            $scope.isLoadingBacklog = false;
        });
    }

    $scope.refreshPage = function () {
        $scope.downloadPullRequests();
        $scope.downloadBacklogItems();
    }

    $scope.changeDate = function (day) {
        $scope.selectedTab = day;
        $scope.saveObj();

        var d = new Date();
        selectedDate = new Date(d.setDate(d.getDate() - day));
        $scope.refreshPage();
    }

    $scope.toggleSettingsVisibility = function () {
        if ($scope.empty($scope.obg) || $scope.empty($scope.obg.personalAccessToken)) {

            $scope.settingsText = "Show Dashboard";
            $scope.showSettings = true;
            return;
        }

        $scope.tokenSet = false;

        if (!$scope.showSettings) {
            $scope.vsoRepository.getAccounts($scope.obg.personalAccessToken).then(function (results) {
                $scope.accounts = results;

                $scope.vsoRepository.getProjects($scope.obg.personalAccessToken, $scope.obg.selectedAccount)
                    .then(function (results) {
                        $scope.projects = results;
                    });
            });
            $scope.settingsText = "Show Dashboard";
            $scope.showSettings = true;
        } else {
            $scope.settingsText = "Show Settings";
            $scope.showSettings = false;
        }
    }

    $scope.isFeature = function (type) {
        if (type === 'Feature' || type === 'User Story') {
            return true;
        }
        return false;
    }

    $scope.isEpic = function (type) {
        if (type === 'Epic') {
            return true;
        }
        return false;
    }

    $scope.isTask = function (type) {
        if (type === 'Task') {
            return true;
        }
        return false;
    }

    $scope.isBug = function (type) {
        if (type === 'Bug') {
            return true;
        }
        return false;
    }

    // Repeat for projectSelected
    $scope.accountSelected = function () {
        $scope.vsoRepository.getProjects($scope.obg.personalAccessToken, $scope.obg.selectedAccount).then(function (results) {
            $scope.projects = results;
            $scope.saveObj();
        });
    }

    $scope.shouldShowPullRequests = function () {
        return ($scope.pullRequests && $scope.pullRequests.length) !== 0 || $scope.isLoadingPR;
    }

    $scope.shouldShowBacklog = function () {
        return ($scope.backlogItems && $scope.backlogItems.length) !== 0 || $scope.isLoadingBacklog;
    }

    $scope.navigateToSettingsIfNew = function () {
        if (_.isEmpty($scope.obg) || _.isEmpty($scope.obg.selectedAccount) || _.isEmpty($scope.obg.selectedProject)) {
            $scope.toggleSettingsVisibility();
        }
    }

    $scope.clearTempToken = function () {
        $scope.temporaryToken.value = '';
        $scope.tokenSet = true;
        $scope.showReEnterTokenButton = true;
    }

    $scope.updateTokenVisibility = function () {
        if (!_.isEmpty($scope.obg.personalAccessToken)) {
            $scope.showReEnterTokenButton = true;
        }
    }

    $scope.saveObj = function () {

        var encryptedObg = angular.copy($scope.obg);

        encryptedObg.personalAccessToken = sjcl.encrypt("password", $scope.obg.personalAccessToken);

        chrome.storage.local.set({ "userInformation": encryptedObg }, function () { });
    }

    $scope.setPersonalAccessToken = function () {
        $scope.obg.personalAccessToken = $scope.temporaryToken.value;
        $scope.saveObj();
    }

    chrome.storage.local.get(["userInformation"], function (data) {
        if (!_.isEmpty(data)) {
            $scope.obg = data.userInformation;
            if (!_.isEmpty($scope.obg.personalAccessToken)) {
                $scope.obg.personalAccessToken = sjcl.decrypt("password", $scope.obg.personalAccessToken);
            }

            getPullRequests();
            $scope.retrieveBacklogItems();
            $scope.updateTokenVisibility();

            chrome.storage.local.get(["selectedTab"], function (data) {
                $scope.selectedTab = data.selectedTab;
            });
        }
        $scope.navigateToSettingsIfNew();
    });
});