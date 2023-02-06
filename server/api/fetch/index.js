const fs = require('fs');
const path = require('path');
const untappd = require('../../untappd');
const FileLoader = require('../../lib/FileLoader');

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
    console.error('[ERROR] in api/fetch > saveData()');
    console.error(e);
    return false;
  }
};

/**
 * Gets the user data.
 *
 * @return object of user data.
 */
const fetchUserData = async () => {
  try {
    const { user } = await untappd.userInfo();
    const date = new Date();

    const data = {
      user,
      lastUpdated: date.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };

    await saveData(data, 'user');
    return user;
  } catch (e) {
    console.error('[ERROR] in api/fetch > fetchUserData()');
    throw new Error(e);
  }
};

/**
 * Get all the checkins for a user.
 *
 * @param {int} latest The most recent checkin. Optional.
 *
 * @return int The number of checkins added.
 */
const fetchUserCheckins = async (latest = null) => {
  const newCheckins = [];
  let untappdCalls = 0;

  const hitUntappd = async function(maxId = null) {
    const { checkins, pagination, error } = await untappd.checkins(maxId);
    let latestFound = false;

    untappdCalls += 1;

    if (error) {
      return;
    }

    for (let index = 0; index < checkins.items.length; index++) {
      if (checkins.items[index].checkin_id === latest) {
        latestFound = true;
        break;
      }

      newCheckins.push(checkins.items[index]);
    }

    // eslint-disable-next-line
    console.log(`[Untappd fetch successful] ${newCheckins.length} new checkins logged.`);

    // rate limit
    if (untappdCalls < 2 && latestFound === false && pagination.max_id) {
      await hitUntappd(pagination.max_id);
    }
  };

  try {
    const { checkins, oldest } = await FileLoader.load('checkins');

    await hitUntappd();

    if (!newCheckins) {
      return 0;
    }

    // eslint-disable-next-line
    console.log(`[Fetch successful] ${newCheckins.length} checkins added.`);

    const newMostRecent = newCheckins[0].checkin_id;
    const allCheckins = newCheckins.concat(checkins);

    // DEBUG - you can modify the local checkin store by slicing the checkins here.
    // const allCheckins = checkins.slice(34);
    // const newMostRecent = allCheckins[0].checkin_id;

    await saveData(
      {
        checkins: allCheckins,
        mostRecent: newMostRecent,
        oldest,
      },
      'checkins',
    );

    return newCheckins.length;
  } catch (e) {
    console.error('[ERROR] in api/fetch > fetchUserCheckins()');
    return 0;
  }
};

/**
 * @return object
 */
exports.post = async (req, res) => {
  try {
    if (req.body.userOnly === 1) {
      const userData = await fetchUserData();
      return res.json({
        success: true,
        data: userData,
      });
    }

    if (req.body.checkinsOnly === 1) {
      const latestCheckin = req.body.latestCheckin || null;
      const newCheckinsAdded = await fetchUserCheckins(latestCheckin);

      return res.json({
        success: true,
        data: {
          newCheckinsAdded,
        },
      });
    }

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
