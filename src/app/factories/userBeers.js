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
     *
     * @param object userData Data for the the user whose beers we're getting
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
    };


    var update = function( username ){
        var
            // the reference to the user data in firebase
            userRef    = ref.child( username ),

            // the synced firebase object
            syncObject = $firebaseObject( userRef );

        syncObject.$loaded( function( response ){

            var beers = response.userBeers;

            if( beers === undefined ){
                // getBeersFromUntappd( userData, syncObject );
            } else {
                // console.log( beers );
                console.log( beers[0].checkin_id );

                var minId = beers[0].checkin_id;

                // the total number of beers to get
                var beersToGet = response.userData.stats.total_checkins;

                // remaining beers
                var newBeerCount = beersToGet - response.userBeers.length;


                var newBeers = [];

                
                /**
                 * Since the Untappd API only allows you to get 50 checkins
                 *  at a time, we'll need to call the endpoint a bunch of
                 *  times to get all of a user's checkins
                 *
                 * @param int remCheckins Number of checkins remaining to get
                 * @param int max_id      Checkin ID that determines which checkin we want to start with
                 */
                var getFeed = function( remCheckins, max_id ){

                    // the untappd endpoint for the user feed
                    var endpoint = 'https://api.untappd.com/v4/user/checkins/' + username + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&limit=' + remCheckins;

                    if( max_id ){
                        endpoint += '&max_id=' + max_id;
                    }

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

                                // the actual checkins
                                checkins         = resp.data.response.checkins ? resp.data.response.checkins.items : resp.data.response.items,

                                returnedCheckins = checkins.length,

                                // the max_id from the return
                                maxId            = checkins[returnedCheckins - 1].checkin_id;
                            
                            newBeerCount = newBeerCount - returnedCheckins;

                            // add the checkins to our local array
                            newBeers = newBeers.concat( checkins );

                            if( newBeerCount > 0 ){
                                getFeed( newBeerCount, maxId );
                            } else {
                                beers = newBeers.concat( beers );
                                syncObject.userBeers = beers;
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

                getFeed( newBeerCount );

            }
        } );

    };

    api.update = update;



    /**
     * gets the user's beers from untappd and saves to firebase
     *
     * @param object userData   Data for user we want to get the beers for
     * @param object syncObject Firebase object service
     */
    function getBeersFromUntappd( userData, syncObject ){

        var

            // the user's username
            username      = userData.user_name,

            // the user's total number of checkins
            totalCheckins = userData.stats.total_checkins,

            // the array of all beers that have been checked in
            beers         = [];

        // getFeed( 0, 326741316, 0 );

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


    /**
     * Since the Untappd API only allows you to get 50 checkins
     *  at a time, we'll need to call the endpoint a bunch of
     *  times to get all of a user's checkins
     *
     * @param int remCheckins Number of checkins remaining to get
     * @param int max_id      Checkin ID that determines which checkin we want to start with
     * @param int min_id      We want to get checkins that are newer than this one
     */
    var getFeed = function( username, max_id, min_id ){

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


                // remCheckins = remCheckins - returnedCheckins;

                // if( lastCheckin === 0 ){
                //     lastCheckin = checkins[0].checkin_id;
                // }

                // add the checkins to our local array
                beers = beers.concat( checkins );


                // if( remCheckins > 0 && maxId ){
                    // getFeed( remCheckins, maxId, min_id );
                // } else {
                    console.log( beers );

                    // syncObject.userBeers = beers;
                    // syncObject.lastCheckin = lastCheckin;

                    // syncObject.$save().then(function(ref){
                    //     return ref.key === syncObject.$id;
                    // }, function( error ){
                    //     console.error( error );
                    // });

                // }

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



    

    /* ------------------------------------------
     * --return
     * ------------------------------------------ */

    // set api data up
    api.data = data;

    // and then return the api
    return api;


} ] );