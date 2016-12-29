
/**
 * factory to get untappd data
 */
angular.module('drinkingBuddyApp')

.factory( 'untappd', [
    '$http',
    'untappdKeys',
    'firebaseService',
function( $http, untappdKeys, firebaseService ){

    var

        api = {
            getUserInfo     : getUserInfo,
            getUserCheckins : getUserCheckins
        },

        // cache the userInfo
        userInfo;


    return api;



    /**
     * Gets the user info data (not checkins) from untappd
     *
     * @param string username The username of the user we want to get the info for
     * @return promise
     */
    function getUserInfo( username ){

        if( typeof username !== 'string' || username === undefined ){
            console.error( "Invalid username" );
            return Promise.resolve( false );
        }
        
        // endpoint for untappd user data
        var endpoint = 'https://api.untappd.com/v4/user/info/' + username + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&compact=true';

        return $http.get( endpoint ).then( function( resp ){

            // error
            if( resp.status !== 200 ){
                console.error( "The Untappd call was successful, but returned a non-success status code." );
                return false;
            }

            // get this into firebase
            firebaseService.save( username, 'userData', resp.data.response.user );

            userInfo = resp.data.response.user;


            // @return object
            return resp.data.response.user;

        }, untappdError );

    }





    /**
     * Gets all the user checkins
     *
     * @param string username The username
     * @return promise
     */
    function getUserCheckins( username ){
        
        var userInfo = getUserInfo( username ).then(function( resp ){
            console.log( resp );
        });
    }




    ///////////////




    /**
     * The http request to the untappd API failed
     */
    function untappdError( error ){
        console.error( "Something went wrong while trying to get the user data from the Untappd API." );

        if( error && error.data && error.data.meta ){
            console.error( error.data.meta.error_detail );
        }

        return false;
    }




}]);