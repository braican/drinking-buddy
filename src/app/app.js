
angular.module('drinkingBuddyApp', [
    'ngRoute',
    'drinkingBuddyApp.sidebar',
    'drinkingBuddyApp.maps',
    'drinkingBuddyApp.fullList'
])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider){
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({
        redirectTo: '/full'
    });
}])


.controller('MainCtrl', [
    '$route',
    '$routeParams',
    '$location',
function MainCtrl($route, $routeParams, $location) {
    console.log( $route );
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
}]);