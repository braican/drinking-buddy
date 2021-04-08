import fs from 'fs';
import path from 'path';
import untappd from '../../untappd';
import FileLoader from '../../lib/FileLoader';

/**
 * Save the data to a flatfile. Returns true on success, false on failure.
 *
 * @param {object} data
 *
 * @return boolean
 */
const saveData = (data, file) => {
  if (!data) {
    return false;
  }

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
  let totalCheckins = [];

  const hitUntappd = async function(maxId = null) {
    const { checkins, pagination } = await untappd.checkins(maxId);
    totalCheckins = totalCheckins.concat(checkins.items);

    /* eslint-disable */
    console.log('hit untappd');
    console.log(totalCheckins.length);
    /* eslint-enable */

    if (pagination.max_id) {
      await hitUntappd(pagination.max_id);
    } else {
      return totalCheckins;
    }
  };

  try {
    const existingCheckins = await FileLoader.load('checkins');

    if (existingCheckins.checkins && existingCheckins.oldest) {
      totalCheckins = [...existingCheckins.checkins].reverse();
      await hitUntappd(existingCheckins.oldest);
    } else {
      await hitUntappd();
    }

    const mostRecent = totalCheckins[0].checkin_id;
    const reversedCheckins = totalCheckins.reverse();
    const oldest = reversedCheckins[0].checkin_id;

    await saveData(
      {
        checkins: reversedCheckins,
        mostRecent,
        oldest,
      },
      'checkins',
    );
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

export const post = async (req, res) => {
  try {
    // await fetchUserData();
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
