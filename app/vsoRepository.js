angular.module('app').service('vsoRepository', function ($q, $http) {

    this.findAll = function() {

      var workItems = "";
      var personalaccesstoken = 'chusz3qyhkd5ravemieglglavuqkltcfmfan7lmcc77ajzmvhh5a';
      var personalaccesstokenbase64 = btoa(personalaccesstoken);

      var config = {headers:  {
        'Accept': 'application/json',
        'Basic': personalaccesstokenbase64
      }};
      var data =     '{  \'Query\': \'Select [System.WorkItemType], [System.Title], [System.State], [Microsoft.VSTS.Scheduling.Effort] FROM WorkItemLinks WHERE [System.Links.LinkType] = \\\'System.LinkTypes.Hierarchy-Forward\\\' AND Target.[System.ChangedDate] > @Today - 7 ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC,[System.Id] ASC MODE (Recursive, ReturnMatchingChildren)\'}'

      return $http.post('https://intergen.visualstudio.com/DefaultCollection/Obrien.ProjectConnect/_apis/wit/wiql?api-version=1.0', data, config)
        .then(function(result){

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
});
