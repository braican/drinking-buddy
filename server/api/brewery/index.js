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

    const breweryCheckins = checkins.filter(ch => false);

    return res.json({
      success: true,
      data: breweryCheckins,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
