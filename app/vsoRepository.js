angular.module('app').service('vsoRepository', function ($q, $http) {

    this.getBacklogChanges = function (daysAgo, onlyShowForStatusChanges, personalaccesstoken, accountName, projectName) {
        var personalaccesstokenbase64 = btoa(personalaccesstoken);
        var workItems = "";
        var config = {
            headers: {
                'Accept': 'application/json',
                'Basic': personalaccesstokenbase64
            }
        };
        var data;
        if (onlyShowForStatusChanges) {
            data = '{  \'Query\': \'Select [System.WorkItemType], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.Effort] FROM WorkItemLinks WHERE ([System.Links.LinkType] = \\\'System.LinkTypes.Hierarchy-Forward\\\'  AND Target.[System.ChangedDate] = @Today - ' + daysAgo + ' AND Target.[Microsoft.VSTS.Common.StateChangeDate] >= @Today - ' + daysAgo + ' AND [Target].[System.AssignedTo] = @Me) ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC,[System.Id] ASC MODE (Recursive, ReturnMatchingChildren)\'}';
        } else {
            data = '{  \'Query\': \'Select [System.WorkItemType], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.Effort] FROM WorkItemLinks WHERE ([System.Links.LinkType] = \\\'System.LinkTypes.Hierarchy-Forward\\\'  AND Target.[System.ChangedDate] = @Today - ' + daysAgo + ' AND [Target].[System.AssignedTo] = @Me)  ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC,[System.Id] ASC MODE (Recursive, ReturnMatchingChildren)\'}';
        }
        return $http.post('https://' + accountName + '.visualstudio.com/DefaultCollection/' + projectName + '/_apis/wit/wiql?api-version=1.0', data, config)
        .then(function (result) {
            angular.forEach(result.data.workItemRelations, function (workItem) {
                workItems += workItem.target.id + ",";
            });
            workItems = workItems.slice(0, -1);
        }).then(function () {
            return $http.get('https://' + accountName + '.visualstudio.com/DefaultCollection/_apis/wit/workitems?api-version=1.0&ids=' + workItems, config)
            .then(function (resultWorkItems) {
                var result = [];

                angular.forEach(resultWorkItems.data.value, function (workItem) {
                    workItem.fields.title = workItem.fields["System.Title"];
                    workItem.fields.workItemType = workItem.fields["System.WorkItemType"];
                    delete workItem.fields["System.Title"];
                    result.push(workItem.fields);
                });
                return result;
            });
        });
    }


    this.getPullRequests = function (personalaccesstoken, accountName, projectName) {
        var personalaccesstokenbase64 = btoa(personalaccesstoken);
        return this.getMyProfileId(personalaccesstokenbase64).then(function (userId) {
            var pullRequests = [];
            var config = {
                headers: {
                    'Accept': 'application/json',
                    'Basic': personalaccesstokenbase64
                }
            };
            var address = 'https://' + accountName + '.visualstudio.com/defaultcollection/' + projectName + '/_apis/git/pullRequests?api-version=1.0&status=completed&creatorId=' + userId + '&$top=50';

            return $http.get(address, config)
                .then(function (result) {
                    angular.forEach(result.data.value,
                        function (pullRequest) {
                            pullRequests.push(pullRequest);
                        });
                    return pullRequests;
                });
        });
    }

    this.getMyProfileId = function (personalaccesstokenbase64) {
        var config = {
            headers: {
                'Accept': 'application/json',
                'Basic': personalaccesstokenbase64
            }
        };
        var address = 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=1.0'
        return $http.get(address, config)
            .then(function (result) {
                return result.data.id;
            });
    }

    this.getAccounts = function (personalaccesstokenbase64) {
        var config = {
            headers: {
                'Accept': 'application/json',
                'Basic': personalaccesstokenbase64
            }
        };
        var address = 'https://app.vssps.visualstudio.com/_apis/Accounts';
        var accounts = [];
        return $http.get(address, config).then(function (results) {
            angular.forEach(results.data,
                function (result) {
                    accounts.push(result.AccountName);
                });

            return accounts;
        });
    }

    this.getProjects = function (personalaccesstokenbase64, account) {
        var config = {
            headers: {
                'Accept': 'application/json',
                'Basic': personalaccesstokenbase64
            }
        };
        var address = 'https://' + account + '.visualstudio.com/DefaultCollection/_apis/projects?api-version=1.0';
        var projects = [];
        return $http.get(address, config).then(function (results) {
            angular.forEach(results.data.value,
                function (result) {
                    projects.push(result.name);
                });

            return projects;
        });
    }
});
