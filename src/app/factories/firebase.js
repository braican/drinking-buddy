
/**
 * factory to get the data from firebase
 */
angular.module('drinkingBuddyApp')

.factory( 'firebaseService', [
    '$firebaseObject',
function( $firebaseObject ){

    var

        api = {
            getUserInfo     : getUserInfo,
            getUserCheckins : getUserCheckins,
            save            : save
        },

        // cache the userInfo
        userInfo,


        // reference to firebase
        ref  = firebase.database().ref().child('/drinking-buddy');


    return api;






    /**
     * Gets user data from firebase. Wrapper for getUserData
     *
     * @param string username The username of the user we're getting
     * @return promise
     */
    function getUserInfo( username ){
        return getUserData( username, 'userData' );
    }




    /**
     * Gets user checkins from firebase. Wrapper for getUserData
     *
     * @param string username The username of the user we're getting
     * @return promise
     */
    function getUserCheckins( username ){
        return getUserData( username, 'userBeers' );
    }







    /**
     * Saves data to firebase
     *
     * @param string username The username
     * @param string key      Key to save the data into
     * @param mixed  value    Value to store
     */
    function save( username, key, value ){
        
        var

            // the reference to the user's nodes
            userRef    = ref.child( username ),

            // sync'd object
            syncObject = $firebaseObject( userRef );

        // write it up
        syncObject[ key ] = value;

        syncObject.$save().then(function(ref){
            console.log( "written to firebase" );
            return ref.key === syncObject.$id;
        }, function( error ){
            console.error( error );
        });

    }



    ///////////////




    /**
     * Gets the user's data
     *
     * @param string username Username
     * @param string key      The key for the data we're getting
     */
    function getUserData( username, key ){

        if( !username ){
            console.error( "Invalid username in the firebase service." );
            return Promise.resolve( false );
        }

        var 

            // reference to this specific user in firebase
            userRef    = ref.child( username ),

            // sync'd object from firebase
            syncObject = $firebaseObject( userRef );

        return syncObject.$loaded().then( function( resp ){

            // the user doesn't exist in firebase, so send off to untapd
            if( resp.$value === null ){
                return false;
            }

            userInfo = resp.userInfo;
            
            return resp[ key ];
        });
    }


}]);