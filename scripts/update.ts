/**
 * This script can be used to update the database with the latest checkins.
 */

/* eslint-disable no-console */
import { TigrisClient, UntappdClient } from '../src/lib/index.js';
import { Mapper } from '../src/utils/index.js';
import type { User } from '../db/models/index.js';

const tigris = await TigrisClient.create();
const untappd = new UntappdClient();
untappd.setToken(process.env.UNTAPPD_ACCESS_TOKEN);

const updateUser = async (): Promise<User> => {
  console.log('Updating the user...');
  const user = await untappd.getUser();
  const newDbUser = Mapper.user(user);
  newDbUser.lastUpdated = new Date();
  await tigris.addUser(newDbUser);
  console.log(`User ${newDbUser.firstName} ${newDbUser.lastName} updated.`);
  return newDbUser;
};

const updateCheckins = async (user: User = null): Promise<void> => {
  console.log('Updating the checkins...');

  if (!user) {
    const untappdUser = await untappd.getUser();
    user = Mapper.user(untappdUser);
  }

  const lastDbCheckin = await tigris.getLastCheckin();
  const dbCheckinCount = await tigris.getCheckinCount();

  console.log('Realtime user checkins (from Untappd):', user.checkins);
  console.log('Checkins in database:', dbCheckinCount);
  console.log(`Fetching ${user.checkins - dbCheckinCount} checkins...`);

  const newCheckins = await untappd.getCheckins(lastDbCheckin.id);
  const totalAdded = await tigris.addCheckins(newCheckins);
  console.log(`${totalAdded} checkins added.`);
};

(async () => {
  try {
    const args = process.argv.slice(2);
    let user = null;

    if (args.includes('all')) {
      console.log('Updating everything...');
      const user = await updateUser();
      await updateCheckins(user);

      return;
    }

    if (args.includes('user')) {
      user = await updateUser();
    }

    if (args.includes('checkins')) {
      await updateCheckins(user);
    }

    if (args.includes('breweries')) {
      console.log('Updating breweries...');
      const breweriesAdded = await tigris.updateBreweries();
      console.log(`${breweriesAdded} breweries added.`);
    }
  } catch (e) {
    console.error('[Error in scripts/update.ts]', e);
  }
})();
