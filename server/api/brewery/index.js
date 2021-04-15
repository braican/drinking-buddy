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
    let rated = 0;
    let cumulativeRating = 0;

    const breweryCheckins = checkins.filter(ch => {
      if (ch.brewery.brewery_slug !== brewery) {
        return false;
      }

      if (!breweryLogged) {
        breweryLogged = true;
        breweryData = ch.brewery;
      }

      if (ch.rating_score > 0) {
        rated += 1;
        cumulativeRating += ch.rating_score;
      }

      return true;
    });

    return res.json({
      success: true,
      data: {
        checkins: breweryCheckins,
        checkinCount: breweryCheckins.length,
        overallRating: cumulativeRating / rated,
        ...breweryData,
      },
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
