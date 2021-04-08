import FileLoader from '../../lib/FileLoader';

export const get = async (req, res) => {
  try {
    const data = await FileLoader.load('user');

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
