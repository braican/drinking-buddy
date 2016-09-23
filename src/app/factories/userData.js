/**
 * factory for the user data
 */
angular.module('drinkingBuddyApp')

.factory( 'userData', [
    '$rootScope',
    '$firebaseObject',
    '$http',
    'untappdKeys',
function( $rootScope, $firebaseObject, $http, untappdKeys ){

    var

        // the API object to return
        api  = {},

        // the data we want returned to the front end
        data = {},

        // the reference to firebase
        ref  = firebase.database().ref().child('/drinking-buddy'),

        // get the previous user from localstorage, and use that
        //  person up as the current person.
        user = localStorage.getItem('lastUser');


    data.username = user;

    if( user ){
        getUserData(user);
    }




    /**
     * gets the user data from firebase, if it exists. If not, get
     *  the data from untappd and then save to firebase.
     * @param user (string)
     *   - the username of the user we're trying to get
     */
    function getUserData(user){
        console.log( "get user " + user );

        var
            // the reference to the user's data in firebase
            userRef    = ref.child( user ),

            // the synchronized object from firebase
            syncObject = $firebaseObject( userRef );


        // load up the user data from firebase
        syncObject.$loaded(function( response ){

            // if the user doesn't exist in Firebase, we'll need to
            //  call the untappd api to get the data.
            if( response.$value === null ){

                getUserDataFromUntappd( user );

            // otherwise the user does exist in firebase, so we have data.
            } else {
                console.log( "user exists..." );
                
                writeUserData( response );
            }
        });
    }




    /**
     * retrieves the userdata from untappd
     * @param user (string)
     *   - the username of the user we want to get info for
     */
    function getUserDataFromUntappd( user ){

        var
            // endpoint for untappd user data
            userEndpoint = 'https://api.untappd.com/v4/user/info/' + user + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&compact=true',
            
            // the reference to the user's data in firebase
            userRef      = ref.child( user ),

            // the synchronized object from firebase
            syncObject   = $firebaseObject( userRef );


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

                var
                    // the user data from the response
                    userData = resp.data.response.user,

                    // since we're grabbing this directly from untappd, we
                    //  need to place the data in an object to pass it back
                    //  to the controller.
                    dataForApi = { userData: userData };


                saveUserDataToFirebase( syncObject, userData );

                writeUserData( dataForApi );
            },

            // the untappd call failed.
            function( error ){
                console.error( "Something went wrong while trying to get the user data from the Untappd API." );

                if( error && error.data && error.data.meta ){
                    console.error( error.data.meta.error_detail );
                }
            }
        );
    }




    /* ------------------------------------------
     * --util
     * ------------------------------------------ */


    /**
     * saves the user data to firebase
     * @param syncObject (object)
     *   - the firebase object service
     * @param data (object)
     *   - the data to save to firebase
     */
    function saveUserDataToFirebase( syncObject, data ){
        
        syncObject.userData = data;

        syncObject.$save().then(function(ref){
            return ref.key === syncObject.$id;
        }, function( error ){
            console.error( error );
        });
    }


    /**
     * write the user data to the data api object.
     * @param returnedData (object)
     *   - the data we want to return to the controller
     */
    function writeUserData( returnedData ){

        // since we got here, we know that the user exists in
        //  untappd, so save the username in localstorage for
        //  retrieval next time the app is loaded.
        var username = returnedData.userData.user_name;

        localStorage.setItem('lastUser', username);

        // set the api data object
        data.untappd = returnedData;


        // broadcast the user data so we know we need to update the
        //  beer list for this user
        $rootScope.$broadcast( 'userData:updated', returnedData.userData );
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
        getUserData(username);
    };
    api.updateUser = updateUser;



    /* ------------------------------------------
     * --return
     * ------------------------------------------ */


    // set the api data key to the data object we've set up
    api.data = data;

    // and then return the api
    return api;



}]);