/**
 * set up a factory for the hair products
 */
angular.module('drinkingBuddyApp')

// $firebaseObject, $firebaseArray, and $firebaseAuth
.factory( 'beerData', [ '$firebaseObject', function( $firebaseObject ){

    var ref = firebase.database().ref().child('/drinking-buddy');

    var syncObject = $firebaseObject(ref);

    // // console.log( ref );
    // syncObject.$loaded(function(){
    //     console.log( syncObject['drinking-buddy'] );
    // });

    return syncObject;

    // return {

    //     // results stores the products that have been selected for
    //     //  the user
    //     results : null,

    //     // adds the results to this
    //     setResults : function( res ){
    //         this.results = res;
    //     },

    //     // goes and gets all the product data from the json file
    //     getData : function(){
    //         return $http.get('data/product-export.json');
    //     }
    // };


} ] );