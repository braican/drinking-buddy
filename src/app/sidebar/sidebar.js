
angular.module('drinkingBuddyApp.sidebar', ['ngRoute'])

.controller('SidebarCtrl', [
    '$scope',
    'userData',
function( $scope, userData ){

    $scope.user = userData.data;
    
    var creds = untappdKeys;



    console.log( creds );



    /* ------------------------------------------
     * --functions
     * ------------------------------------------ */

    /**
     * loads a new user
     */
    $scope.loadUser = function(){
        userData.updateUser( $scope.newUser );
    }


}]);