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
        console.log( "get user " + user );
        var
            // the reference to the firebase database
            ref        = firebase.database().ref().child('/drinking-buddy/' + user),

            // the data
            syncObject = $firebaseObject( ref );


        // load up the user data from firebase
        syncObject.$loaded(function( response ){
            console.log( response );

            // if the user doesn't exist in Firebase, we'll need to
            //  call the untappd api to get the data.
            if( response.$value === null ){

                // endpoint for untappd user data
                var userEndpoint = 'https://api.untappd.com/v4/user/info/' + user + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&compact=true';

                // call the untappd API
                $http.get( userEndpoint ).then(

                    // the untappd call was a success.
                    function( resp ){

                        // error
                        if( resp.status !== 200 ){
                            console.error( "The Untappd call was successful, but returned a non-success status code." );
                            return false;
                        }

                        // success
                        var userData = resp.data.response.user;

                        syncObject.userData = userData;

                        console.log( userData );
                        data.untappd = userData;

                        syncObject.$save().then(function(ref){
                            ref.key === syncObject.$id;
                        }, function( error ){
                            console.error( error );
                        });
                    },

                    // the untappd call failed.
                    function( error ){
                        console.error( "Something went wrong with the call to the Untappd API." );

                        if( error && error.data && error.data.meta ){
                            console.error( error.data.meta.error_detail );
                        }
                    }
                );

            } else {
                console.log( "user exists..." );
                console.log( response );
                data.untappd = response;
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



    /* ------------------------------------------
     * --return
     * ------------------------------------------ */


    // set the api data key to the data object we've set up
    api.data = data;

    // and then return the api
    return api;



}]);