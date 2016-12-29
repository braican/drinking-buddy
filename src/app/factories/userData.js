/**
 * factory for the user data
 */
angular.module('drinkingBuddyApp')

.factory( 'userData', [
    '$rootScope',
    'firebaseService',
    'untappd',
function( $rootScope, firebaseService, untappd ){

    var

        totalCheckins = 0,

        checkins         = [],


        // the API object to return
        api = {

            data : {
                checkins      : checkins,
                totalCheckins : totalCheckins
            },

            // func
            getInfo     : getInfo,
            getCheckins : getCheckins,
            updateUser  : updateUser
        };

    return api;



    
    /**
     * Getter for the user info
     *
     * @param string username (optional) The username of the user we want data for. If empty, get the most recent from localstorage
     * @return promise
     */
    function getInfo( username ){

        username = username || localStorage.getItem('lastuser');

        if( typeof username !== 'string' || username === undefined || username === null ){
            console.error( "Invalid username in the userData service." );
            return Promise.resolve( false );
        }

        console.log( "get user " + username );

        var tryFirebase = firebaseService.getUserInfo( username );

        return tryFirebase.then(function( data ){

            total_checkins = data.stats.total_checkins;


            // not in firebase, so go to untappd to get it
            if( data === false || data === undefined ){
                return untappd.getUserInfo( username );
            }

            return data;

        });
    }



    /**
     * Getter for the user's checkins
     *
     * @param string username (optional) The username of the user we want checkins for. If empty, get the most recent from localstorage
     * @return promise
     */
    function getCheckins( username ){

        username = username || localStorage.getItem('lastuser');

        if( typeof username !== 'string' || username === undefined || username === null ){
            console.error( "Invalid username in the userData service." );
            return Promise.resolve( false );
        }

        console.log( "get checkins for " + username );

        var tryFirebase = firebaseService.getUserCheckins( username );

        return tryFirebase.then( function( checkins ) {

            // not in firebase, go to untappd
            if( checkins === false || checkins === undefined ){
                return untappd.getUserCheckins( username );
            }

            return checkins;
        });

    }




    /**
     * Updates the user data with the new data for the given user.
     * @param string username New name of the user we're looking to get data for
     */
    function updateUser( username ){
        localStorage.setItem( 'lastuser', username );

        return getInfo( username ).then( function( resp ) {
            return resp;
        });
    };



}]);