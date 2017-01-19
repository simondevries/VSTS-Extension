angular.module('app').service('vsoRepository', function ($q, $http) {

  var storedBacklogItems = {};


  this.getBacklogChanges = function(daysAgo, onlyShowForStatusChanges, personalaccesstoken) {
    var personalaccesstokenbase64 = btoa(personalaccesstoken);
    var workItems = "";
    var config = {headers:  {
      'Accept': 'application/json',
      'Basic': personalaccesstokenbase64
    }};
    var data = '';
    if(onlyShowForStatusChanges){
      data = '{  \'Query\': \'Select [System.WorkItemType], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.Effort] FROM WorkItemLinks WHERE [System.Links.LinkType] = \\\'System.LinkTypes.Hierarchy-Forward\\\' AND Target.[System.ChangedDate] = @Today - ' + daysAgo + ' AND Target.[Microsoft.VSTS.Common.StateChangeDate] >= @Today - ' + daysAgo + ' ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC,[System.Id] ASC MODE (Recursive, ReturnMatchingChildren)\'}';
    }else{
      data = '{  \'Query\': \'Select [System.WorkItemType], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.Effort] FROM WorkItemLinks WHERE [System.Links.LinkType] = \\\'System.LinkTypes.Hierarchy-Forward\\\' AND Target.[System.ChangedDate] = @Today - ' + daysAgo + ' ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC,[System.Id] ASC MODE (Recursive, ReturnMatchingChildren)\'}';
    }
      alert('12');
    return $http.post('https://intergen.visualstudio.com/DefaultCollection/Obrien.ProjectConnect/_apis/wit/wiql?api-version=1.0', data, config)
    .then(function(result){
      alert('13');
      angular.forEach(result.data.workItemRelations, function(workItem) {
        workItems += workItem.target.id + ",";
      });
      workItems = workItems.slice(0, -1);
    })
    .then(function(){
      return $http.get('https://intergen.visualstudio.com/DefaultCollection/_apis/wit/workitems?api-version=1.0&ids=' + workItems,  config)
      .then(function(resultWorkItems){
        var result = [];

        angular.forEach(resultWorkItems.data.value, function(workItem) {
          workItem.fields.title = workItem.fields["System.Title"]
          delete workItem.fields["System.Title"]
          result.push(workItem.fields);
        });


        return result;

      });
    });
  }


  this.getPullRequests = function(personalaccesstoken){
    var personalaccesstokenbase64 = btoa(personalaccesstoken);
    return this.getMyProfileId(personalaccesstokenbase64).then( function(userId){
      var pullRequests = [];
      var config = {headers:  {
        'Accept': 'application/json',
        'Basic': personalaccesstokenbase64
      }};
      var address = 'https://intergen.visualstudio.com/defaultcollection/Obrien.ProjectConnect/_apis/git/pullRequests?api-version=1.0&status=completed&creatorId=' + userId;

      return $http.get(address, config)
      .then(function(result){
        angular.forEach(result.data.value, function(pullRequest) {
          pullRequests.push(pullRequest);
        });
        return pullRequests;
      })
    });
  }


  this.getMyProfileId = function(personalaccesstokenbase64){
    var config = {headers:  {
      'Accept': 'application/json',
      'Basic': personalaccesstokenbase64
    }};
    var address = 'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=1.0'
    return $http.get(address, config)
    .then(function(result){
      return result.data.id;
    })
  }

});
