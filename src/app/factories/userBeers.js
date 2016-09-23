/**
 * set up a factory for the hair products
 */
angular.module('drinkingBuddyApp')

// $firebaseObject, $firebaseArray, and $firebaseAuth
.factory( 'userBeers', [
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
        ref  = firebase.database().ref().child('/drinking-buddy');

    // this event gets a userData object, with the user data from untappd
    $rootScope.$on('userData:updated', function( event, userData ){
        getUserBeers( userData );
    });


    /**
     * gets the user's beers
     * @param userData (object)
     *   - the data for the the user whose beers we're getting
     */
    var getUserBeers = function( userData ){
        
        var
            // the user's username
            username   = userData.user_name,

            // the reference to the user data in firebase
            userRef    = ref.child( username ),

            // the synced firebase object
            syncObject = $firebaseObject( userRef );


        syncObject.$loaded( function( response ){

            var beers = response.userBeers;

            if( beers === undefined ){
                getBeersFromUntappd( userData, syncObject );
            } else {
                console.log( beers );
            }
        } );
    }



    /**
     * gets the user's beers from untappd and saves to firebase
     * @param userData (object)
     *   - the data for user we want to get the beers for
     * @param syncObject (object)
     *   - the firebase object service
     */
    function getBeersFromUntappd( userData, syncObject ){

        var

            // the user's username
            username      = userData.user_name,

            // the user's total number of checkins
            totalCheckins = userData.stats.total_checkins,

            // the most recent checkin ID
            lastCheckin   = 0,

            // the array of all beers that have been checked in
            beers         = [];


        /**
         * Since the Untappd API only allows you to get 50 checkins
         *  at a time, we'll need to call the endpoint a bunch of
         *  times to get all of a user's checkins
         * @param remCheckins (number)
         *    - the number of checkins remaining to get
         * @param max_id (number)
         *    - a checkin ID that determines which checkin we want to
         *       start with
         * @param min_id (number)
         *    - we want to get checkins that are newer than this one
         */
        var getFeed = function( remCheckins, max_id, min_id ){

            // the untappd endpoint for the user feed
            var endpoint = 'https://api.untappd.com/v4/user/checkins/' + username + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&limit=50&max_id=' + max_id + '&min_id=' + min_id;

            $http.get( endpoint ).then(

                // untappd call was a success
                function( resp ){

                    console.log( resp );

                    // error
                    if( resp.status !== 200 ){
                        console.error( "The Untappd call to retrieve the checkins was successful, but returned a non-success status code." );
                        return false;
                    }

                    // success
                    var

                        // the number of checkins returned from this call
                        returnedCheckins = resp.data.response.checkins ? resp.data.response.checkins.count : resp.data.response.count,

                        // the actual checkins
                        checkins         = resp.data.response.checkins ? resp.data.response.checkins.items : resp.data.response.items,

                        // the max_id from the return, indicating the checkin
                        //  we should start with for the next call.
                        maxId            = resp.data.response.pagination ? resp.data.response.pagination.max_id : checkins[returnedCheckins - 1].checkin_id;


                    remCheckins = remCheckins - returnedCheckins;

                    if( lastCheckin === 0 ){
                        lastCheckin = checkins[0].checkin_id;
                    }

                    // add the checkins to our local array
                    beers = beers.concat( checkins );


                    if( remCheckins > 0 && maxId ){
                        getFeed( remCheckins, maxId, min_id );
                    } else {
                        console.log( beers );

                        syncObject.userBeers = beers;
                        syncObject.lastCheckin = lastCheckin;
                        syncObject.currentCheckinCount = beers.length;

                        syncObject.$save().then(function(ref){
                            return ref.key === syncObject.$id;
                        }, function( error ){
                            console.error( error );
                        });

                    }

                },

                // untappd call was an error
                function( error ){
                    console.error( "Something went wrong while trying to get the user's beer data from the Untappd API." );

                    if( error && error.data && error.data.meta ){
                        console.error( error.data.meta.error_detail );
                    }
                }
            );
        }



        // getFeed( totalCheckins, 34574578, 0 );
        // getFeed( totalCheckins, 37534316, 0 );
        // getFeed( totalCheckins, 61362899, 0 );
        // getFeed( totalCheckins, 81117017 );


        // getFeed( totalCheckins, 82034066, 81117017 ); // shows most recent checkin to checkin before min_id
        
        // getFeed( totalCheckins, 81117017, 82034066 ); // shows most recent checkin to checkin before min_id

        //
        // 82097258 - stella
        // 82034066 - tripel threat
        // 82017188 - pepe nero
        //
        // 81263878 - grumpy monk
        // 81117017 - fin du monde
        // 77949979 - out of bounds
        //


    }

    

    /* ------------------------------------------
     * --return
     * ------------------------------------------ */

    // set api data up
    api.data = data;

    // and then return the api
    return api;


} ] );