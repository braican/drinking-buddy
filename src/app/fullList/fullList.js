
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

    var vm = this;

    // vm.user = userData.data;

    vm.beers = userBeers.getBeers();


    // console.log( vm.beers );

}]);