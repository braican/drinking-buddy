const FileLoader = require('../../lib/FileLoader');

/**
 * @return object
 * @property {int}   checkins
 * @property {array} latestCheckins
 */
exports.get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');
    const { brewery } = req.query;
    let breweryLogged = false;
    let breweryData = {};
    const beers = {};
    let rated = 0;
    let cumulativeRating = 0;

    const breweryCheckins = checkins.filter(ch => {
      if (ch.brewery.brewery_slug !== brewery) {
        return false;
      }

      // Brewery data.
      if (!breweryLogged) {
        breweryLogged = true;
        breweryData = ch.brewery;
      }

      // Ratings.
      if (ch.rating_score > 0) {
        rated += 1;
        cumulativeRating += ch.rating_score;
      }

      // Beers.
      if (!beers[ch.beer.bid]) {
        beers[ch.beer.bid] = {
          beer: ch.beer.beer_name,
          label: ch.beer.beer_label,
          style: ch.beer.beer_style,
          abv: ch.beer.beer_abv,
          lastHad: ch.created_at,
          checkins: [
            {
              date: ch.created_at,
              rating: ch.rating_score,
            },
          ],
        };
      } else {
        const b = beers[ch.beer.bid];

        beers[ch.beer.bid] = {
          checkins: b.checkins.push({
            date: ch.created_at,
            rating: ch.rating_score,
          }),
          ...b,
        };
      }

      return true;
    });

    const sortedBeers = Object.values(beers)
      .sort((a, b) => (a.beer > b.beer ? 1 : -1))
      .map(beer => ({
        checkinCount: beer.checkins.length,
        rating: (
          beer.checkins.reduce((total, ch) => ch.rating + total, 0) / beer.checkins.length
        ).toFixed(2),
        ...beer,
      }));

    return res.json({
      success: true,
      data: {
        checkins: breweryCheckins,
        checkinCount: breweryCheckins.length,
        overallRating: (cumulativeRating / rated).toFixed(2),
        beerCount: sortedBeers.length,
        beers: sortedBeers,
        ...breweryData,
      },
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
