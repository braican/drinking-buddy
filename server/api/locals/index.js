const FileLoader = require('../../lib/FileLoader');

/**
 * @return object
 * @property {int}   checkins
 * @property {array} latestCheckins
 */
exports.get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');
    const { state } = req.query;

    const byBrewery = {};

    const stateCheckins = checkins.filter(
      ch => ch.brewery.location.brewery_state.toUpperCase() === state.toUpperCase(),
    );

    stateCheckins.forEach(ch => {
      const {
        brewery_slug: slug,
        brewery_name: name,
        location: { brewery_state: state },
      } = ch.brewery;
      const brewery = byBrewery[slug];

      if (brewery) {
        byBrewery[slug].checkinCount += 1;
        byBrewery[slug].cumulative += ch.rating_score;
        byBrewery[slug].state = state;
      } else {
        byBrewery[slug] = { name, slug, checkinCount: 1, cumulative: ch.rating_score, state };
      }
    });

    const allBreweries = Object.values(byBrewery).map(brewery => ({
      ...brewery,
      avg: (brewery.cumulative / brewery.checkinCount).toFixed(2),
    }));

    const bestRatedBreweries = allBreweries.sort((a, b) => {
      if (a.avg > b.avg) {
        return -1;
      }

      if (a.avg < b.avg) {
        return 1;
      }

      return a.checkinCount > b.checkinCount ? -1 : 1;
    });
    // .filter(({ checkinCount }) => checkinCount > 5)
    // .slice(0, 20);

    return res.json({
      success: true,
      data: {
        bestRatedBreweries,
      },
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
