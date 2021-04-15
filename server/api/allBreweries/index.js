const FileLoader = require('../../lib/FileLoader');
const slugify = require('../../util/slugify');

/**
 * @return object
 * @property {int}   checkins
 * @property {array} latestCheckins
 */
exports.get = async (req, res) => {
  try {
    const { checkins } = await FileLoader.load('checkins');
    const breweries = new Map();

    checkins.forEach(ch => {
      const { brewery_name: name, brewery_id: id } = ch.brewery;
      const slug = slugify(name);

      if (!breweries.has(slug)) {
        breweries.set(slug, { name, id, slug });
      }
    });

    return res.json({
      success: true,
      data: Object.fromEntries(breweries),
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
