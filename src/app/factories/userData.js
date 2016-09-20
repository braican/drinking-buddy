/**
 * factory for the user data
 */
angular.module('drinkingBuddyApp')

.factory( 'userData', ['$firebaseObject', '$http', 'untappdKeys', function( $firebaseObject, $http, untappdKeys ){

    
    var

        // the API object to return
        api  = {},

        // the data we want returned to the front end
        data = {},

        // get the previous user from localstorage, and use that
        //  person up as the current person.
        user = localStorage.getItem('lastUser');


    data.username = user;


    if( user ){
        getUserFromFirebase(user);
    }


    
    /**
     * gets the user data from firebase
     * @param user (string)
     *   - the username of the user we're trying to get
     */
    function getUserFromFirebase(user){
        console.log( "get em" );
        var
            // the reference to the firebase database
            ref        = firebase.database().ref().child('/drinking-buddy/' + user),

            // the data
            syncObject = $firebaseObject( ref );

        syncObject.$loaded(function( response ){
            console.log( response );

            if( response.$value === null ){

            } else {
                data.firebase = response;
            }
            

        });
    }




    /* ------------------------------------------
     * --api functions
     * ------------------------------------------ */


    /**
     * updates the user data with the new data for the given user.
     * @param username (string)
     *   - the new name of the user we're looking to get data for
     */
    var updateUser = function( username ){
        data.username = username;
        getUserFromFirebase(username);
    }
    api.updateUser = updateUser;



    // set the api data key to the data object we've set up
    api.data = data;

    // and then return the api
    return api;



}]);