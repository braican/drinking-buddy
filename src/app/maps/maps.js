
angular.module('drinkingBuddyApp.maps', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/maps',{
        template   : 'maps.html',
        controller : 'MapsCtrl'
    });
}])

.controller('MapsCtrl', [function(){

}]);