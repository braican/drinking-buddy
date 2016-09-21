
angular.module('drinkingBuddyApp.sidebar', ['ngRoute'])

.controller('SidebarCtrl', [
    '$scope',
    'userData',
function( $scope, userData ){

    $scope.user = userData.data;
    

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