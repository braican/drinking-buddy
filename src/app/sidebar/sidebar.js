
angular.module('drinkingBuddyApp.sidebar', ['ngRoute'])

.controller('SidebarCtrl', [
    '$scope',
    'userData',
    'userBeers',
function( $scope, userData, userBeers ){

    $scope.user = userData.data;
    

    /* ------------------------------------------
     * --functions
     * ------------------------------------------ */

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