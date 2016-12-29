
angular.module('drinkingBuddyApp.fullList', ['ngRoute'])

.config(['$routeProvider', function( $routeProvider ){
    $routeProvider.when('/full',{
        templateUrl : 'fullList.html',
        controller  : 'FullListCtrl as beerlist'
    });
}])

.controller('FullListCtrl', [
    '$scope',
    'userData',
function( $scope, userData ){

    // cache
    var vm = this;


    vm.data = userData.data;



    // userData.getCheckins().then(function( resp ){
    //     console.log( resp );
    // });


    // untappd.getUserData( "rossflowers" ).then(function( resp ){
    //     console.log( resp );
    // });

    // var
    //     username    = userData.getUsername(),
    //     beerPromise = userBeers.getBeers( username );

    // // array of all the checkins
    // vm.checkins;


    // // get the user beers, if we have a valid promise
    // if( beerPromise ){

    //     beerPromise.then( function( checkins ){
    //         vm.checkins = checkins;
    //         console.log( checkins );
    //     });
    // }



}]);