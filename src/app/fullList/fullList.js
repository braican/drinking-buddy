
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        templateUrl : 'fullList.html',
        controller  : 'FullListCtrl'
    });
}])

.controller('FullListCtrl', [
    '$scope',
    'userData',
    'userBeers',
function( $scope, userData, userBeers ){

    $scope.user = userData.data;

    $scope.beers = userBeers.data;

}]);