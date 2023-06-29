/**
 * This seed script will seed the Tigris database with the data from the `backup-2023.05.31.json`
 * data files for checkins and user. Both these files are syncs of Untappd data accurate up to May
 * 31, 2023 (it should be 5570 checkins total).
 */

/* eslint-disable no-console */

import fs from 'fs';
import { TigrisClient, UntappdClient } from '../src/lib/index.js';
import { Mapper } from '../src/utils/index.js';

const DATA_FILE_PATH = './data/checkins-backup-2023.05.31.json';

const seedUser = async (tigris: TigrisClient) => {
  const client = new UntappdClient();

  client.setToken(process.env.UNTAPPD_ACCESS_TOKEN);

  try {
    const user = await client.getUser();
    const payload = Mapper.user(user);
    await tigris.addUser(payload);
    console.log('User added.');
  } catch (e) {
    console.error('[Error in scripts/seed.ts]', e);
  }
};

const seedCheckins = async (tigris: TigrisClient) => {
  await fs.readFile(DATA_FILE_PATH, async (err, data) => {
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
    console.log(`${totalAdded} checkins added.`);

    const addedBreweries = await tigris.updateBreweries();
    console.log(`${addedBreweries} breweries added.`);
  });
};

(async () => {
  const tigris = await TigrisClient.create();

  await seedUser(tigris);
  await seedCheckins(tigris);
})();
