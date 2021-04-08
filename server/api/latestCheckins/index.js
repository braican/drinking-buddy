import FileLoader from '../../lib/FileLoader';

/**
 * @return object
 * @property {int}   checkins
 * @property {array} latestCheckins
 */
export const get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');

    return res.json({
      success: true,
      data: {
        checkins: checkins.length,
        latestCheckins: checkins.slice(0, 20),
      },
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
