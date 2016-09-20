
angular.module('drinkingBuddyApp', [
    'ngRoute',
    'firebase',
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
}]);