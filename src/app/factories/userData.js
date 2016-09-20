/**
 * factory for the user data
 */
angular.module('drinkingBuddyApp')

.factory( 'userData', ['$firebaseObject', function( $firebaseObject ){

    // get the previous user, and use that person up as the current person
    var user = localStorage.getItem('lastUser');

    // no user
    if( ! user ){
        console.log( "no user" );
    }

    
    // var
    //     // the reference to the firebase database
    //     ref        = firebase.database().ref().child('/drinking-buddy/' + user),

    //     // 
    //     syncObject = ;



    return{};
}]);