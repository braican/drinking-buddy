
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        templateUrl : 'fullList.html',
        controller  : 'FullListCtrl'
    });
}])

.controller('FullListCtrl', ['$scope', 'beerData', function( $scope, beerData ){

    $scope.data = beerData;

}]);