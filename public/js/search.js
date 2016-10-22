(function(){

    var app = angular.module('people',[]);

    app.controller('PeopleController',function($scope, $http){
        $scope.person = [];

        $scope.getPerson = function () {
            $http({method : 'GET', url : 'http://localhost:3000/search'})
                .success(function(data, status) {
                    $scope.person = data;
                })
                .error(function(data, status) {
                    alert("Error");
                })
        }
    });

})();
