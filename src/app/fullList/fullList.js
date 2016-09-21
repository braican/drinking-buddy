
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        templateUrl : 'fullList.html',
        controller  : 'FullListCtrl'
    });
}])

.controller('FullListCtrl', [
    '$scope',
    'beerData',
    'userData',
function( $scope, beerData, userData ){

    $scope.data = beerData;

    $scope.user = userData.data;

}]);