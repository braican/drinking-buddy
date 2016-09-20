/**
 * the keys for untappd
 */
angular.module('drinkingBuddyApp')

.factory( 'untappdKeys', function(){

    return {
        // the untappd api secret
        api_secret: 'YOUR_API_SECRET',

        // the untappd api id
        api_id: 'YOUR_API_ID'
    };
    
});