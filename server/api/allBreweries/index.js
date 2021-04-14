const FileLoader = require('../../lib/FileLoader');

/**
 * @return object
 * @property {int}   checkins
 * @property {array} latestCheckins
 */
exports.get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');

    const breweries = {};

    checkins.forEach(ch => {
      const { brewery_name, brewery_id } = ch.brewery;

      if (!breweries[brewery_id]) {
        breweries[brewery_id] = brewery_name;
      }
    });

    return res.json({
      success: true,
      data: breweries,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
