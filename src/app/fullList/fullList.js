
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        template   : 'fullList.html',
        controller : 'FullListCtrl'
    });
}])

.controller('FullListCtrl', [function(){

}]);