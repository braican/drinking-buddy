/**
 * This seed script will seed the Tigris database with the data from the `backup-2023.05.31.json`
 * data files for checkins and user. Both these files are syncs of Untappd data accurate up to May
 * 31, 2023 (it should be 5570 checkins total).
 */

/* eslint-disable no-console */

import fs from 'fs';
import { TigrisClient, UntappdClient, Mapper } from '../util/index.ts';
import type { User } from '../db/models/index.ts';

const seedUser = async (tigris: TigrisClient) => {
  const client = new UntappdClient();

  try {
    const user = await client.getUser();
    const payload: User = {
      id: user.id,
      username: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.user_avatar_hd,
      badges: user.stats.total_badges,
      checkins: user.stats.total_checkins,
      beers: user.stats.total_beers,
    };

    await tigris.addUser(payload);
    console.log('User added.');
  } catch (e) {
    console.error('[Error in scripts/seed.ts]', e);
  }
};

const seedCheckins = async (tigris: TigrisClient) => {
  const path = './data/checkins-backup-2023.05.31.json';

  await fs.readFile(path, async (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const json = JSON.parse(data.toString());
    const checkins = json?.checkins;

    if (!checkins) {
      console.log('No checkins to add.');
      return;
    }

    const mappedCheckins = checkins.map(Mapper.checkin);
    console.log(`Adding ${mappedCheckins.length} checkins...`);

    const totalAdded = await tigris.addCheckins(mappedCheckins);
    console.log(`${totalAdded} added.`);
  });
};

(async () => {
  const tigris = await TigrisClient.create();

  await seedUser(tigris);
  await seedCheckins(tigris);
})();
