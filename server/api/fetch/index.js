import fs from 'fs';
import path from 'path';
import * as req from '../../../util/req';
import untappd from '../../untappd';

/**
 * Save the data to a flatfile. Returns true on success, false on failure.
 *
 * @param {object} data
 *
 * @return boolean
 */
const saveData = (data, file) => {
  try {
    return fs.writeFileSync(
      path.join(`${__dirname}/../../../data/${file}.json`),
      JSON.stringify(data),
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

/**
 * Gets the user data.
 *
 * @return void
 */
const fetchUserData = async () => {
  try {
    const data = await untappd.userInfo();
    await saveData(data, 'user');
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

/**
 * Get all the checkins for a user.
 *
 * @return void
 */
const fetchUserCheckins = async () => {
  try {
    const data = await req.get('https://jsonplaceholder.typicode.com/todos/20');
    await saveData(data, 'checkins');
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

export const post = async (req, res) => {
  try {
    await fetchUserData();
    await fetchUserCheckins();

    return res.json({
      success: true,
    });
  } catch (e) {
    console.error(e);
    return res.json({
      success: false,
    });
  }
};
