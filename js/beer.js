//
// - BEER (namespace)
//
(function(BEER, $, undefined){

    var USER_DATA = {
            checkins: []
        },

        _BREWERIES = {},
        _BEERS = {},
        _VENUES = {},
        _STATS = {},

        weekDistribution = {},
        monthDistribution = {},

        // designy stuff
        FADESPEED = 400;


    // --------------------------
    // util
    //

    /**
     * Object.size
     * 
     * @return the size of the object
     */
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    /**
     * addDay
     * @param (string) date : the date string from the checkin data
     *
     * add the day of the week
     */
    function addDay(date){
        if(date.indexOf('Mon') > -1){
            _STATS.days.monday ++;
        } else if(date.indexOf('Tue') > -1){
            _STATS.days.tuesday ++;
        } else if(date.indexOf('Wed') > -1){
            _STATS.days.wednesday ++;
        } else if(date.indexOf('Thu') > -1){
            _STATS.days.thursday ++;
        } else if(date.indexOf('Fri') > -1){
            _STATS.days.friday ++;
        } else if(date.indexOf('Sat') > -1){
            _STATS.days.saturday ++;
        } else if(date.indexOf('Sun') > -1){
            _STATS.days.sunday ++;
        }
    }

    /**
     * sortHads
     * @param (mixed) a : sort object 1
     * @param (mixed) b : sort object 2
     *
     * sort the hads
     */
    function sortHads(a, b){
        if(a.hads < b.hads){
            return 1;
        } else {
            return -1;
        }
    }

    /**
     * returnArray
     * @param (object) v : the element of the array
     * @param (integer) i : the index in the array
     * @return (array) just returns an array
     */
    function returnArray(v, i){
        return [v];
    }

    /**
     * formatDate
     * @param (date) date : the date of the checkin
     * @return (string) the formatted date
     */
    function formatDate(date){

        var dateObj = new Date(date),
            dayOfWeek = dateObj.format('W'),
            dateFormatted = dateObj.format('M j, Y');
        
        return dateFormatted;
    }

    /**
     * createStatsVar
     * @return (object) the initialized _STATS variable
     */
    function createStatsVar(){

        var statObj = {
            checkins_at_venues: 0,

            days: {
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            },

            ratings: {},

            streak: {
                number: 1
            }
        };

        return statObj;
    }

    /**
     * getWeekDistribution
     * @param (array) checkins : the list of checkin objects
     * @return (object) the distribution of beers per week
     */
    function getWeekDistribution(checkins){
        var currIndex = 0,
            weeksSince = 0,
            upperBound = new Date(),
            lowerBound = getLastMonday(),
            dObj = [{
                tooltip: lowerBound.format('F j, Y') + ' - ' + upperBound.format('F j, Y'),
                label: lowerBound.format('n/j/y') + ' - ' + upperBound.format('n/j/y'),
                count: 0
            }];

        createDistributionObject(checkins[currIndex]);

        function createDistributionObject(checkinObj){

            if(checkinObj){
                var checkinDate = new Date(checkinObj.created_at);

                checkinDate.setHours(0,0,0,0);

                if(checkinDate >= lowerBound && checkinDate <= upperBound){
                    dObj[weeksSince].count++;
                    currIndex++;

                    createDistributionObject(checkins[currIndex]);
                } else if(checkinDate < lowerBound){

                    upperBound = new Date(lowerBound.getFullYear(), lowerBound.getMonth(), lowerBound.getDate() - 1);
                    lowerBound = getLastWeek(lowerBound);

                    lowerBound = new Date(lowerBound);

                    weeksSince++;

                    dObj[weeksSince] = {
                        tooltip: lowerBound.format('F j, Y') + ' - ' + upperBound.format('F j, Y'),
                        label: lowerBound.format('n/j/y') + ' - ' + upperBound.format('n/j/y'),
                        count: 0
                    };

                    createDistributionObject(checkinObj);
                }
            }
        }

        function getLastMonday() {
            var today = new Date();
            today.setHours(0,0,0,0);
            today.setDate(today.getDate() - (today.getDay() - 1 ));
            return today;
        }

        function getLastWeek(day){
            var lastWeek = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 7);
            return lastWeek.setHours(0,0,0,0);
        }

        _STATS.weeksOnUntappd = weeksSince + 1;

        return dObj;
    }

    /**
     * getAverageBreweryHads
     *
     * return the average number of hads for all of this user's breweries
     */
    function getAverageBreweryHads(){
        var numBreweries = 0,
            hads = 0;

        $.each(_BREWERIES, function(index, b) {
            numBreweries++;
            hads += b.hads;
        });

        return hads / numBreweries;
    }

    /**
     * getAverageBreweryRating
     *
     * return the average rating for this user's breweries
     */
    function getAverageBreweryRating(){
        var numBreweries = 0,
            totalAverage = 0;

        $.each(_BREWERIES, function(index, b) {
            numBreweries++;
            totalAverage += b._aggregateRating / Object.size(b.uniqueBeers);
        });

        return totalAverage / numBreweries;
    }
    
    // --------------------------
    // aux functions
    //

    /**
     * doErrorMessage
     * @param (string) error : the error message we should output stuff for
     * 
     * show various error messages
     */
    function doErrorMessage(error){
        var errorMessage;
        switch (error){
            case "invalid_auth":
                errorMessage = "There is no user with that username.";
                $('#new-user').trigger('click');
                break;
            case "invalid_limit":
                errorMessage = "The app has reached its API limit. Please try again later.";
                break;
            default:
                errorMessage = "Unknown error";
                break
        }

        $('#messages .error').empty().text(errorMessage).show();

        $('#loading').fadeOut(FADESPEED, function(){
            $('#messages').fadeIn(FADESPEED);
        }); 
    }

    /**
     * ajaxError
     * @param (jqxhr) jqxhr : The jqXHR object
     * @param (string) status : type of error that occurred
     * @param (string) error : error thrown
     */
    function ajaxError(jqxhr, status, error){
        var responseText = JSON.parse(jqxhr.responseText);
        console.log('--- ERROR ---');
        console.log(error);
        console.log(responseText);
        console.log('--- /ERROR ---');

        if(responseText.meta.error_type){
            doErrorMessage(responseText.meta.error_type);
        }
    }


    // --------------------------
    // --event listeners
    //

    /**
     * showComment
     * @param (object) event : click
     *
     * show this chckin's comment
     */
    function showComment(event){
        var comment = $(this).data('comment'),
            posX = event.pageX + 10,
            posY = event.pageY - 20;

        $('.beer-comment').remove();

        $('<div class="beer-comment">' + comment + '</div>').appendTo('.page').css({
            'top'      : posY + 'px',
            'left'     : posX + 'px'
        });
    }

    /**
     * openNewUserDrawer
     * @param (object) event : the event data from the click
     *
     * opens the big drawer
     */ 
    function openNewUserDrawer(event){
        
        event.preventDefault();
        
        $('#new-user-search').toggleClass('active');
        $('.main-content').toggleClass('pushdown');
        $('.sidebar-content').toggleClass('pushdown');

        setTimeout(function(){
            if($('#new-user-search').hasClass('active')){
                $('.new-user-name').focus();
            }            
        }, 1000);

    }

    /**
     * refreshList
     * @param (object) event : the event data from the click
     *
     * refresh the current user's stats and stuff
     */
    function refreshList(event){
        var user = $(this).data('user');

        $('#main > div:visible').fadeOut(FADESPEED, function(){
            resetApp();
            getCheckins(user);
        });
    }

    /**
     * loadNewUser
     * @param (object) event : the event data from the submit
     *
     * load up a new user
     */
    function loadNewUser(event){
        event.preventDefault();
        
        var newUser = $(this).siblings('.new-user-name').val();

        if(newUser != localStorage['last_user'] && newUser != ""){
            $('#main').removeClass('sidebar-reveal');

            setTimeout(function(){

                $('#new-user-search').removeClass('active');
                $('.main-content').removeClass('pushdown');
                $('.sidebar-content').removeClass('pushdown');
            
                $('#main > div:visible').fadeOut(FADESPEED);

                setTimeout(function(){
                    resetApp('full');

                    $('.new-user-name').val('');

                    if(localStorage[newUser + "_data"]){
                        renderPage(newUser);
                        localStorage['last_user'] = newUser;
                    } else {
                        getCheckins(newUser);
                    }
                }, FADESPEED);
            }, 500);
        }
    }

    /**
     * filterBeersByBrewery
     * @param (object) event : the data from the click
     *
     * filter beers based on the brewery that was clicked
     */
    function filterBeersByBrewery(event){
        var breweryID = $(this).data('breweryid');
        
        $('#beers tbody tr').removeClass('hiderow').filter(function(){
            return $(this).data('breweryid') != breweryID;
        }).addClass('hiderow');
        
        $(this).addClass('active').siblings().removeClass('active');
        $('#show-all-beers').addClass('active');
    }

    //
    // CTAs
    //

    /**
     * showAllBeers
     * @param (object) event : the data from the click
     *
     * show all of the beers in the list
     */
    function showAllBeers(event){
        $('#beers tbody tr').removeClass('hiderow');
    }


    // --------------------------
    // main app functions
    //

    /**
     * resetApp
     *
     * reset the values in the app
     */
    function resetApp(full){

        $('#checkins tbody').empty();
        $('#beers tbody').empty();
        $('#breweries tbody').empty();
        $('#streak').empty();
        $('#loading .loading-bar').empty();
        $('.stat-cell .data').empty();
        $('#loading .number-of-beers').text('');

        USER_DATA = {
            checkins: []
        };

        _BREWERIES = {};
        _BEERS = {};
        _VENUES = {};

        weekDistribution = {};
        monthDistribution = {};

        $('#loading').fadeIn(FADESPEED);

        if(full){
            $('.user-image').remove();
            $('.username').empty();
        }
    }

    /**
     * getCheckins
     * @param (string) user : the user who's checkins we should get
     *
     * gets all of the checkins and stores them in our global variable. We will
     *  iterate over this data to make it more what we want later
     */
    function getCheckins(user){

        var checkins = 0;

        $('#loading').fadeIn(FADESPEED);

        if(user){
            $.getJSON('https://api.untappd.com/v4/user/info/' + user + '?client_id=' + BEER.api_id + '&client_secret=' + BEER.api_secret + '&compact=true', function(data){
                checkins = data.response.user.stats.total_checkins;

                var loadingBarMarkup = '',
                    loadingBars = Math.floor(checkins / 50);

                USER_DATA.stats = data.response.user.stats;
                USER_DATA.userData = {
                    username: data.response.user.user_name,
                    userPic: data.response.user.user_avatar,
                    bio: data.response.user.bio
                };

                localStorage['last_user'] = user;

                for(var i = 0; i < loadingBars; i++){
                    loadingBarMarkup += '<div class="tick"></div>';
                }

                $('#loading .loading-bar').append(loadingBarMarkup);
                $('#loading .number-of-beers').text("You've checked in " + checkins + " beers");

                create(checkins, 0, 1);
            }).error(ajaxError);

            function create(remCheckins, offset, index){
                $.getJSON('http://api.untappd.com/v4/user/checkins/' + user + '?client_id=' + BEER.api_id + '&client_secret=' + BEER.api_secret + '&limit=50&max_id=' + offset, function(data){
                    var _tmpCheckins = data.response.checkins.items,
                        lastCheckin = data.response.pagination.max_id;
                        
                    USER_DATA.checkins.push.apply(USER_DATA.checkins, _tmpCheckins);
                    remCheckins -= data.response.checkins.count;

                    $('#loading .loading-bar .tick:nth-child(' + index + ')').addClass('fill');

                    if(remCheckins > 0 && lastCheckin){
                        create(remCheckins, lastCheckin, index + 1);
                    } else {
                        // store the data in localstorage
                        localStorage[user + '_data'] = JSON.stringify(USER_DATA);

                        // render the page
                        renderPage(user);
                    }
                }).error(ajaxError);
            } 
        } else {
            console.log("No user");
        }
    }

    /**
     * renderPage
     * @param (string) user : the user that we're getting data for
     *
     * render the page and all it's tables and stuff
     */
    function renderPage(user){
        var rawData = JSON.parse(localStorage[user + "_data"]),
            checkins = rawData.checkins,
            prevBeer,
            prevBeerName,
            currStreak = 1;

        _STATS = createStatsVar();

        $('#refresh').data('user', user);

        // render the user data
        renderUserData(user);

        // --setters
        weekDistribution = getWeekDistribution(checkins);

        $.each(checkins, function(index, checkin){

            var beer = checkin.beer.beer_name,
                beerID = checkin.beer.bid,
                brewery = checkin.brewery.brewery_name;

            createBeerObject(index, checkin);

            if(prevBeer && prevBeer == beerID) {
                currStreak++;
            } else {
                if(currStreak > _STATS.streak.number){
                    _STATS.streak.number = currStreak;
                    _STATS.streak.beer = prevBeerName
                }
                currStreak = 1;
            }

            prevBeer = beerID;
            prevBeerName = brewery + ' ' + beer;

        });

        //
        // do stuff after the each
        //
        var beerArray = $.map(_BEERS, returnArray),
            breweryArray = $.map(_BREWERIES, returnArray),
            averageBreweryHads = getAverageBreweryHads(),
            averageBreweryRating = getAverageBreweryRating();
    
        // add the stats for total number of venues and breweries
        $('#total_at_venues .data').text(_STATS.checkins_at_venues);
        $('#total_breweries .data').text(breweryArray.length);

        // create the checkin, beer, and brewery tables
        renderCheckinTable(checkins);
        renderBeerTable(beerArray);
        renderBreweryTable(breweryArray, averageBreweryHads, averageBreweryRating);

        // add cool stats
        addCoolStats(checkins);

        //
        // show the page
        //
        setTimeout(function(){
            $('#main > div:visible').fadeOut(FADESPEED)
            
            setTimeout(function(){
                $('#main').addClass('sidebar-reveal');
                $('#data').fadeIn(FADESPEED);

                setTimeout(function(){
                    // draw charts
                    drawTheCharts(checkins);

                    // add the maps
                    addVenueMap();
                    addBreweryMap();
                }, 1000);
                
            }, FADESPEED);
            
        }, 100);
        
    }


    // -------------------------------
    // data creation functions
    //

    /**
     * createBeerObject
     * @param (int) index : where we are in the raw json
     * @param (object) checkin : the single checkin data
     *
     * using the raw json output of all the checkins, run through them all
     *  and reformat the data so we can use it the way we want to
     */
    function createBeerObject(index, checkin){
        var beer = checkin.beer.beer_name,
            beerID = checkin.beer.bid,

            brewery = checkin.brewery.brewery_name,
            breweryID = checkin.brewery.brewery_id,
            breweryLocation = checkin.brewery.location,
            
            date = checkin.created_at,
            rating = checkin.rating_score;
        
        // stats for the breweries
        breweryStats(brewery, breweryID, breweryLocation, beerID, rating);
        
        // stats for the beers
        beerStats(beer, beerID, brewery, breweryID, rating);
        
        // stats for the venues, if there is a venue
        if(! (checkin.venue instanceof Array ) ){
            var venueID = checkin.venue.venue_id,
                venueName = checkin.venue.venue_name,
                venueLocation = checkin.venue.location;

            // incremenet the number of checkins at venues
            _STATS.checkins_at_venues++;

            venueStats(venueName, venueID, venueLocation);
        }

        // generic stats
        if(_STATS.ratings[rating]){
            _STATS.ratings[rating]++;
        } else {
            _STATS.ratings[rating] = 1;
        }
        addDay(date);
    }

    /**
     * breweryStats
     * @param (string) brewery : the name of the brewery
     * @param (string) breweryID : the brewery id
     * @param (string) breweryLocation : where the brewery is
     * @param (string) beerID : the beer ID of the checkin to take note of the unique beers from this brewery
     * @param (string) rating : the numeric rating to average all the ratings
     *
     * add the data to the _BREWERIES object
     */
    function breweryStats(brewery, breweryID, breweryLocation, beerID, rating){
        if(_BREWERIES[breweryID]){
            _BREWERIES[breweryID].hads ++;

            // if($.inArray(beerID, _BREWERIES[breweryID].uniqueBeers ) == -1 ){
                // _BREWERIES[breweryID].uniqueBeers.push(beerID);
                // _BREWERIES[breweryID]._aggregateRating += rating;
            // }

            if(_BREWERIES[breweryID].uniqueBeers.hasOwnProperty(beerID)){
                _BREWERIES[breweryID].uniqueBeers[beerID].hads++;
            } else {
                _BREWERIES[breweryID].uniqueBeers[beerID] = {
                    hads: 1,
                    rating: rating
                };
                _BREWERIES[breweryID]._aggregateRating += rating;
            }

        } else {
            _BREWERIES[breweryID] = {
                id: breweryID,
                name: brewery,
                location: breweryLocation,
                hads: 1,
                uniqueBeers: {},
                _aggregateRating: rating
            }

            _BREWERIES[breweryID].uniqueBeers[beerID] = {
                hads: 1,
                rating: rating
            }
        }
    } 
    /**
     * beerStats
     * @param (string) beer : the name of the beer
     * @param (string) beerID : the beer id
     * @param (string) brewery : the brewery who brews the beer
     * @param (string) breweryID : the brewery ID
     * @param (string) rating : the rating the user gave this beer
     *
     * add the data to the _BEER object
     */
    function beerStats(beer, beerID, brewery, breweryID, rating){
        if(_BEERS[beerID]){
            _BEERS[beerID].hads ++;
        } else {
            _BEERS[beerID] = {
                name: beer,
                brewery: brewery,
                breweryID: breweryID,
                rating: rating,
                hads: 1
            }
        }
    }
    /**
     * venueStats
     * @param (string) venue : the name of the venue
     * @param (string) venueID : the venue id
     * @param (string) venueLocation : the location of the venue
     *
     * add the data to the _VENUES object
     */
    function venueStats(venue, venueID, venueLocation){
        if(_VENUES[venueID]){
            _VENUES[venueID].visits ++;
        } else {
            _VENUES[venueID] = {
                name: venue,
                location: venueLocation,
                visits: 1
            }
        }
    }

    // -------------------------------
    // --rendering functions
    //

    /**
     * renderUserData
     * @param (string) user : the user for whom to render the data
     *
     * add all of the data stuff, like username, checkin numbers, uniques, venues, etc.
     */
    function renderUserData(user){
        var data = JSON.parse(localStorage[user + '_data']);

        if(data){
            var stats = ['total_checkins', 'total_beers', 'total_badges'];
            $('.username').text(data.userData.username);
            if(data.userData.userPic && $('.user-image').attr('src') != data.userData.userPic){
                $('.username').after('<img class="user-image" src="' + data.userData.userPic + '">');
            }

            $.each(stats, function(i, s){
                $('#' + s + ' .data').text(data.stats[s]);
            });

        } else {
            console.log("no data");
        }
    }

    /**
     * renderCheckinTable
     * @param (array) checkins : the array of checkin objects
     *
     * render the checkin table
     */
    function renderCheckinTable(checkins){
        $('#checkins table').tablesorter({
            sortList: [[3,1]],
            headers: {
                '.util':{
                    sorter:false
                }
            }
        });
        
        $.each(checkins, function(index, checkin) {
            var beer = checkin.beer.beer_name,
                brewery = checkin.brewery.brewery_name,
                date = formatDate(checkin.created_at),
                venue = checkin.venue.venue_name ? checkin.venue.venue_name : 'none',
                comment = checkin.checkin_comment,
                row = '<tr class="hoverstyle">'; // kick the row markup off

            row += '<td width="5%" class="util">';
            // add the icon for the comment, if there is once
            if(comment){
                row += '<div class="comment-container" data-comment="' + comment + '">';
                row += '<svg version="1.1" id="speech_bubble" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="20px" viewBox="-49.833 6.167 24 20" enable-background="new -49.833 6.167 24 20" xml:space="preserve"><g><path d="M-30.561,8.985c0.502,0,0.909,0.407,0.909,0.909v8c0,0.5-0.407,0.909-0.909,0.909h-7.272h-0.582l-0.475,0.338l-3.489,2.492v-1.013v-1.817h-1.817h-0.909c-0.502,0-0.909-0.409-0.909-0.909v-8c0-0.502,0.407-0.909,0.909-0.909H-30.561 M-30.561,7.167h-14.545c-1.506,0-2.728,1.221-2.728,2.728v8c0,1.506,1.221,2.727,2.728,2.727h0.909v4.546l6.363-4.546h7.272c1.506,0,2.728-1.221,2.728-2.727v-8C-27.833,8.388-29.055,7.167-30.561,7.167L-30.561,7.167z"/></g></svg>';
                row += '</div>';
            }
            row += '</td>';
            // add the brewery and the beer
            row += '<td width="49%">' + brewery + ' ' + beer + '</td>';
            // add the venue
            row += '<td width="28%">' + venue + '</td>';
            // add the date
            row += '<td width="18%">' + date + '</td>'
            // close the row
            row += '</tr>';

            $('#checkins tbody').append(row);
        });
        $("#checkins table").trigger("update", [true]);
    }

    /**
     * renderBeerTable
     * @param (array) beers : the array of beers
     *
     * render the beers data
     */
    function renderBeerTable(beers){
        $('#beers table').tablesorter({
            sortList: [[2,1]]
        });
        $.each(beers, function(index, val) {
            var row = '<tr data-breweryid="' + val.breweryID + '">' +
                        '<td width="36%">' + val.name + '</td>' +
                        '<td width="36%">' + val.brewery + '</td>' +
                        '<td width="14%">' + val.hads + '</td>' +
                        '<td width="14%">' + val.rating + '</td>' +
                       '</tr>';
            $('#beers tbody').append(row);
        });
        $("#beers table").trigger("update", [true]);
    }

    /**
     * renderBreweryTable
     * @param (array) breweries : the array of breweries
     * @param (number) avgHads : the average number of hads for all the breweries
     * @param (number) totalAvgRating : the average rating for all the breweries
     *
     * render the brewery data
     */
    function renderBreweryTable(breweries, avgHads, totalAvgRating){
        
        $('#breweries table').tablesorter({
            sortList: [[1,1]]
        });

        $.each(breweries, function(index, val) {

            var numberUnique = Object.size(val.uniqueBeers),
                avgRating = Math.round(val._aggregateRating / numberUnique * 100) / 100,
                powerRating = getPowerRating(val.uniqueBeers, totalAvgRating),
                powerRating2 = Math.round( ( (avgRating / totalAvgRating) * (val.hads / avgHads) + numberUnique) * 100 ) / 100,
                row = '<tr data-breweryid="' + val.id + '">' +
                        '<td width="48%">' + val.name + '</td>' +
                        '<td width="12%">' + val.hads + '</td>' +
                        '<td width="12%">' + numberUnique + '</td>' +
                        '<td width="14%">' + avgRating + '</td>' +
                        '<td width="14%">' + powerRating + '</td>' +
                        // '<td width="10%">' + powerRating2 + '</td>' +
                    '</tr>';
            $('#breweries tbody').append(row);

        });
        $("#breweries table").trigger("update", [true]);
    }

    function getPowerRating(uniques, totalAvgRating){
        var powerRating = 0;
        $.each(uniques, function(index, val) {
            // powerRating += (Math.log(val.hads + 1) * Math.pow( (val.rating / 2.5), 2) * Object.size(uniques + 1) );
            powerRating += (Math.log(val.hads + 1) * 12) * Math.pow( (val.rating / totalAvgRating), 5);
            // powerRating += val.hads * Math.pow( (val.rating / totalAvgRating), 5);
        });

        return Math.round(((powerRating / 248) * 100) * 10) / 10;
        // return Math.round(powerRating * 100) / 100;
    }

    /**
     * drawTheCharts
     * @param (array) checkins : the list of checkins
     *
     * draws the charts
     */
    function drawTheCharts(checkins){
        chart_dayOfWeek();

        chart_beersPerWeek(checkins);
    }

    /**
     * chart_beersPerWeek
     * @param (array) checkins : the list of checkin objects
     *
     * draw the chart for the day of the week
     */
    function chart_beersPerWeek(checkins){

        var weekDistributionArray = $.map(weekDistribution, function(item, index) {
                return item.count;
            }),
            weekLabels = $.map(weekDistribution, function(item, index){
                return index;
            }),
            interval =  Math.floor(_STATS.weeksOnUntappd / 5);

        $('#chart_beers-per-week').highcharts({
            chart: {
                type: "line",
                style:{
                    fontFamily: 'inherit',
                    width: '100%'
                },
                zoomType: 'x'
            },
            tooltip: {
                formatter: function() {
                    return weekDistribution[this.x].tooltip + '<br/><b>'+ this.y +' beers</b></div>';
                }
            },
            title: {
                text: "Beers per week"
            },
            legend:{
                enabled: false
            },
            credits:{
                enabled: false
            },
            xAxis:{
                labels: {
                    formatter: function(){
                        return weekDistribution[this.value].label;
                    }
                },
                categories: weekLabels.reverse(),
                tickInterval: interval,
                minRange: 5
            },
            yAxis:{
                tickPixelInterval: 50,
                min: 0,
                title: {
                    text: "Number of beers"
                }
            },
            series:[{
                name: "Beers per week",
                data: weekDistributionArray.reverse()
            }]
        });
    }

    /**
     * chart_dayOfWeek
     *
     * draw the chart for the day of the week
     */
    function chart_dayOfWeek(){
        $('#chart_day-of-week').highcharts({
            chart: {
                type: "column",
                style:{
                    fontFamily: 'inherit',
                    width: '100%'
                }
            },
            colors:['#0074ab'],
            credits:{
                enabled: false
            },
            title: {
                text: "Beers per day of week"
            },
            legend:{
                enabled: false
            },
            tooltip: {
                formatter: function() {
                    return this.x + '<br/><b>'+ this.y +' beers</b></div>';
                }
            },
            xAxis:{
                categories: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
            yAxis:{
                tickPixelInterval: 50,
                min: 0,
                title: {
                    text: "Number of beers"
                }
            },
            series:[{
                name: "Number of beers",
                data: [_STATS.days.monday, _STATS.days.tuesday, _STATS.days.wednesday, _STATS.days.thursday, _STATS.days.friday, _STATS.days.saturday, _STATS.days.sunday]
            }]

        });
    }

    /**
     * addCoolStats
     * @param (array) checkins : because you never know what we may be able to do 
     *                           with the list of checkins
     *
     * this function's name should be pretty self explanitory
     */
    function addCoolStats(checkins){

        var averagePerWeek = Math.round((checkins.length/_STATS.weeksOnUntappd) * 100) / 100;

        $('#streak').html('longest streak - ' + _STATS.streak.number + ' ' + _STATS.streak.beer + ' in a row');
        $('#beers-per-week').html('Beers per week - ' + averagePerWeek)
    }

    /**
     * addVenueMap
     * 
     * create the map of all the venues
     */
    function addVenueMap(){
        var bounds = new google.maps.LatLngBounds(),
            markers = [],
            infowindows = [];

        var map = new google.maps.Map(document.getElementById('map-venues'), {
            center: new google.maps.LatLng(42.365885, -71.258658),
            zoom: 10,
            maxZoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        $.each(_VENUES, function(index, venue) {
            
            var venueName = venue.name,
                lat = venue.location.lat,
                lng = venue.location.lng,
                googleLatLng = new google.maps.LatLng(lat, lng);

            bounds.extend(googleLatLng);

            var marker = new google.maps.Marker({
                position: googleLatLng,
                map: map
            });

            markers.push(marker);

            var infowindow = new google.maps.InfoWindow({
                content: venueName
            });

            infowindows.push(infowindow);

            google.maps.event.addListener(marker, 'click', function(){
                
                $.each(infowindows, function(index, ifw) {
                    ifw.close();
                });

                infowindow.open(map, marker);
            });
        });

        google.maps.event.trigger(map, 'resize');
        
    }

    /**
     * addBreweryMap
     * 
     * create the map of all the breweries
     */
    function addBreweryMap(){
        var bounds = new google.maps.LatLngBounds(),
            markers = [],
            infowindows = [];

        var map = new google.maps.Map(document.getElementById('map-breweries'), {
            center: new google.maps.LatLng(42.365885, -71.258658),
            zoom: 10,
            maxZoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        $.each(_BREWERIES, function(index, brewery) {
            
            var breweryName = brewery.name,
                lat = brewery.location.lat,
                lng = brewery.location.lng,
                googleLatLng = new google.maps.LatLng(lat, lng);

            bounds.extend(googleLatLng);

            var marker = new google.maps.Marker({
                position: googleLatLng,
                map: map
            });

            markers.push(marker);

            var infowindow = new google.maps.InfoWindow({
                content: breweryName
            });

            infowindows.push(infowindow);

            google.maps.event.addListener(marker, 'click', function(){
                
                $.each(infowindows, function(index, ifw) {
                    ifw.close();
                });

                infowindow.open(map, marker);
            });
        });

        google.maps.event.trigger(map, 'resize');
        
    }


    //
    // public functions
    //

    BEER.getBreweries = function(){
        return _BREWERIES;
    }
    BEER.getBeers = function(){
        return _BEERS;
    }
    BEER.getVenues = function(){
        return _VENUES;
    }
    BEER.getStats = function(){
        return _STATS;
    }
    BEER.getUserData = function(user){
        if(user){
            return JSON.parse(localStorage[user + "_data"]);    
        } else {
            return JSON.parse(localStorage[localStorage['last_user'] + "_data"]);
        }
        
    }


    $(document).ready(function(){

        //
        // the event listeners
        //

        // --user flow
        // open the new user drawer
        $('#new-user').on('click', openNewUserDrawer);
        // refresh current user
        $('#refresh').on('click', refreshList);
        // load up a new user
        $('.load-user button').on('click', loadNewUser);

        // --breweries clicks
        $('#breweries').on('click', 'tbody tr', filterBeersByBrewery);

        // --see a comment
        // $('section').on('click', 'tr[data-comment]', showComment);

        // -- the ctas
        $('#show-all-beers').on('click', showAllBeers);

        //
        // LET'S GO DRINK
        //

        $('#main').css('minHeight', ($(window).height() - 44) + 'px');

        // lets kick this thing off
        if(localStorage['last_user']){
            $('#loading').fadeIn();
            var lastUser = localStorage['last_user'];
            if(! localStorage[lastUser + "_data"] ){
                getCheckins(lastUser);
            } else {
                renderPage(lastUser);
            }
        } else {
            $('#new-user').trigger('click');
        }

         
    });
    

})(window.BEER = window.BEER || {}, jQuery);

