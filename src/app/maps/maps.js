
angular.module('drinkingBuddyApp.maps', ['ngRoute', 'drinkingBuddyApp'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/maps',{
        templateUrl : 'maps.html',
        controller  : 'MapsCtrl'
    });
}])

.controller('MapsCtrl', [function(){
}]);