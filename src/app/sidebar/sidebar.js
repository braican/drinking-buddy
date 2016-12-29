
angular.module('drinkingBuddyApp.sidebar', ['ngRoute'])

.controller('SidebarCtrl', [
    'userData',
function( userData ){

    // cache
    var vm = this;


    vm.newUser = '';

    vm.userInfo = {};


    userData.getInfo().then(function( resp ){
        vm.userInfo = resp;
    });




    //
    // ACTION
    //
    

    /**
     * loads a new user
     */
    vm.loadUser = function(){
        if( vm.newUser === '' ){
            console.error( "Please enter a valid username to look up." );
        }

        userData.updateUser( vm.newUser ).then( function( resp ){
            vm.userInfo = resp;
        });

    };


    /**
     *
     */
    vm.updateBeers = function( username ){
        userBeers.update( username );
    };



}]);