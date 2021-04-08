import fs from 'fs';
import path from 'path';
import * as req from '../../../util/req';
import { untappd } from '../../../index';

/**
 * Get the data from Untappd.
 * @return object
 */
const getData = async () => {
  try {
    console.log(process.env.UNTAPPD_CLIENT_ID);
    return {
      test: '2',
    };
    // return await req.get('https://jsonplaceholder.typicode.com/todos/20');
  } catch (e) {
    throw new Error('Error in `getData`.');
  }
};

/**
 * Save the data to a flatfile. Returns true on success, false on failure.
 *
 * @param {object} data
 *
 * @return boolean
 */
const saveData = data => {
  try {
    return fs.writeFileSync(
      path.join(`${__dirname}/../../data/checkins.json`),
      JSON.stringify(data),
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const post = async (req, res) => {
  try {
    const data = await getData();
    const save = saveData(data);

    return res.json({
      success: save,
    });
  } catch (e) {
    return res.json({
      success: false,
    });
  }
};
