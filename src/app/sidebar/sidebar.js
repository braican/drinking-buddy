
angular.module('drinkingBuddyApp.sidebar', ['ngRoute'])

.controller('SidebarCtrl', [
    '$scope',
    'userData',
    'userBeers',
function( $scope, userData, userBeers ){

    var vm = this;


    vm.username = userData.getUsername();


    vm.user = userData.getUserData( vm.username ).then( function( response ){

        console.log( response );
    });

    

    /**
     * loads a new user
     */
    $scope.loadUser = function(){
        userData.updateUser( $scope.newUser );
    };


    /**
     *
     */
    $scope.updateBeers = function( username ){
        userBeers.update( username );
    };



}]);