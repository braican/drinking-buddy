const FileLoader = require('../../lib/FileLoader');

/**
 * @return object
 * @property {int}    checkinCount
 * @property {object} latestCheckin
 * @property {int}    missingCheckins (optional)
 */
exports.get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');

    const data = {
      checkinCount: checkins.length,
      latestCheckin: checkins[0],
    };

    if (req.query.userCheckinCount) {
      data.missingCheckins = req.query.userCheckinCount - checkins.length;
    }

    return res.json({
      success: true,
      data,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
