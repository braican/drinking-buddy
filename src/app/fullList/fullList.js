
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        templateUrl : 'fullList.html',
        controller  : 'FullListCtrl'
    });
}])

.controller('FullListCtrl', [function(){

}]);