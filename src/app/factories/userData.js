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
        api  = {
            getUsername : getUsername,
            getUserData : getUserData,
            updateUser  : updateUser
        },

        // the data we want returned to the front end
        data = {},

        // the reference to firebase
        ref  = firebase.database().ref().child('/drinking-buddy');


    return api;




    /**
     * Gets the username of the current user
     *
     * @return string
     */
    function getUsername(){
        if( localStorage.getItem('lastUser') ){
            return localStorage.getItem('lastUser');
        }
        return '';
    }






    /**
     * gets the user data from firebase, if it exists. If not, get
     *  the data from untappd and then save to firebase.
     *
     * @param string user The username of the user we're trying to get
     * @return promise
     */
    function getUserData( user ){
        console.log( "get user " + user );

        if( user === '' ){
            return false;
        }

        var
            // the reference to the user's data in firebase
            userRef    = ref.child( user ),

            // the synchronized object from firebase
            syncObject = $firebaseObject( userRef );


        // load up the user data from firebase
        var promise = syncObject.$loaded().then( function( response ){

            // if the user doesn't exist in Firebase, we'll need to
            //  call the untappd api to get the data.
            if( response.$value === null ){

                getUserDataFromUntappd( user );

            // otherwise the user does exist in firebase, so we have data.
            } else {
                console.log( "user exists..." );
                console.log( response );

                return response.userData;
            }
        });

        return promise;

    }




    /**
     * retrieves the userdata from untappd
     *
     * @param string user Username of the user we want to get info for
     * @return promise
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
        return $http.get( userEndpoint ).then(

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



    /**
     * updates the user data with the new data for the given user.
     * @param string username New name of the user we're looking to get data for
     */
    function updateUser( username ){
        data.username = username;
        getUserData(username);
    };




    /////////////



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



    /**
     * Error logging for errors
     *
     * @param error
     */
    function untappdError( error ){
        console.error( "Something went wrong while trying to get the user's beer data from the Untappd API." );

        if( error && error.data && error.data.meta ){
            console.error( error.data.meta.error_detail );
        }
    }

}]);