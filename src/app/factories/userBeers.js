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

        // the api to return
        api  = {
            update   : update,
            getBeers : getBeers
        },

        // the reference to firebase
        ref  = firebase.database().ref().child('/drinking-buddy');


    // // this event gets a userData object, with the user data from untappd
    // $rootScope.$on('userData:updated', function( event, userData ){
    //     getUserBeers( userData );
    // });


    // return
    return api;


    /**
     * Gets the beer data
     *
     * @param string username The user we're getting beers for
     */
    function getBeers( username ){

        if( !username ){
            return false;
        }


        var
            // the reference to the user's data in firebase
            userRef    = ref.child( username ),

            // the synchronized object from firebase
            syncObject = $firebaseObject( userRef );


        // load up the user data from firebase
        return syncObject.$loaded().then( function( response ){

            // if the user doesn't exist in Firebase, we'll need to
            //  call the untappd api to get the data.
            if( response.$value === null ){
                console.error( "User doesn't exist in firebase" );

            // otherwise the user does exist in firebase, so we have data.
            } else {
                console.log( "user exists, lets get beer..." );

                return response.userBeers;
            }
        });
    }


    /**
     * gets the user's beers
     *
     * @param object userData Data for the the user whose beers we're getting
     */
    function getUserBeers( userData ){
        
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
     * Update the user beers
     *
     * @param string username User we want to get beers for
     */
    function update( username ){
        var
            // the reference to the user data in firebase
            userRef    = ref.child( username ),

            // the synced firebase object
            syncObject = $firebaseObject( userRef );

        syncObject.$loaded( function( response ){

            var beers = response.userBeers;

            if( beers === undefined ){
                console.log( "No beers found" );
                return false;
            }

            var

                // the last beer we have stored
                minId        = beers[0].checkin_id,

                // the user's total beers
                beersToGet   = response.userData.stats.total_checkins,

                // the number of new beers we want to get
                newBeerCount = beersToGet - response.userBeers.length,

                // init an array to hold all the new beers
                newBeers     = [];


            if( newBeerCount < 1 ){
                console.log( "No new beers" );
                return false;
            }

            
            /**
             * Since the Untappd API only allows you to get 50 checkins
             *  at a time, we'll need to call the endpoint a bunch of
             *  times to get all of a user's checkins
             *
             * @param int remCheckins Number of checkins remaining to get
             * @param int maxId       Checkin ID that determines which checkin we want to start with
             */
            var getNewBeers = function( remCheckins, maxId ){

                // the untappd endpoint for the user feed
                var endpoint = 'https://api.untappd.com/v4/user/checkins/' + username + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&limit=' + remCheckins;

                if( maxId ){
                    endpoint += '&max_id=' + maxId;
                }

                $http.get( endpoint ).then( function( resp ){

                    // error
                    if( resp.status !== 200 ){
                        console.error( "The Untappd call to retrieve the checkins was successful, but returned a non-success status code." );
                        return false;
                    }

                    // success
                    var

                        // the actual checkins
                        checkins         = resp.data.response.checkins ? resp.data.response.checkins.items : resp.data.response.items,

                        // how many checkins we got in this request
                        returnedCheckins = checkins.length,

                        // the max_id from the return
                        newMaxId          = checkins[returnedCheckins - 1].checkin_id;
                    
                    newBeerCount = newBeerCount - returnedCheckins;

                    // add the checkins to our local array
                    newBeers = newBeers.concat( checkins );

                    if( newBeerCount > 0 ){
                        getNewBeers( newBeerCount, newMaxId );
                    } else {
                        beers = newBeers.concat( beers );
                        syncObject.userBeers = beers;
                        syncObject.$save().then(function(ref){
                            return ref.key === syncObject.$id;
                        }, function( error ){
                            console.error( error );
                        });
                    }

                }, untappdError );
            }
            
            getNewBeers( newBeerCount );

        } );

    }



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



        /**
         * Since the Untappd API only allows you to get 50 checkins
         *  at a time, we'll need to call the endpoint a bunch of
         *  times to get all of a user's checkins
         *
         * @param int maxId Checkin ID that determines which checkin we want to start with
         */
        var getAllBeers = function( maxId ){

            // the untappd endpoint for the user feed
            var endpoint = 'https://api.untappd.com/v4/user/checkins/' + username + '?client_id=' + untappdKeys.api_id + '&client_secret=' + untappdKeys.api_secret + '&limit=100';

            if( maxId ){
                endpoint += '&max_id=' + maxId;
            }

            $http.get( endpoint ).then( function( resp ){

                // error
                if( resp.status !== 200 ){
                    console.error( "The Untappd call to retrieve the checkins was successful, but returned a non-success status code." );
                    return false;
                }

                // success
                var

                    // the actual checkins
                    checkins         = resp.data.response.checkins ? resp.data.response.checkins.items : resp.data.response.items,

                    // the number of checkins returned from this call
                    returnedCheckins = checkins.length,

                    // the max_id from the return, indicating the checkin  we should start with for the next call.
                    newMaxId         = checkins[returnedCheckins - 1].checkin_id;


                totalCheckins = totalCheckins - returnedCheckins;


                // add the checkins to our local array
                beers = beers.concat( checkins );


                if( totalCheckins > 0 && maxId ){
                    getAllBeers( username, newMaxId );
                } else {
                    console.log( beers );

                    syncObject.userBeers = beers;
                    syncObject.$save().then(function(ref){
                        return ref.key === syncObject.$id;
                    }, function( error ){
                        console.error( error );
                    });
                }

            }, untappdError );
        }

        getAllBeers( username );

    }






    /////////////


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


} ] );