import FileLoader from '../../lib/FileLoader';

export const get = async (req, res) => {
  try {
    const { checkins, ...rest } = await FileLoader.load('checkins');

    return res.json({
      success: true,
      // data: [checkins[1798], checkins[1799].beer, checkins[1800].beer, checkins[1801].beer],
      data: checkins.length,
      rest,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
