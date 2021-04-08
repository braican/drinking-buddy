import fs from 'fs';
import path from 'path';

const getData = async id => {
  try {
    const data = fs.readFileSync(path.join(`${__dirname}/../../../data/${id}.json`), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
};

export const get = async (req, res) => {
  try {
    const data = await getData('checkins');

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
