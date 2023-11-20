/**
 * This seed script will seed the database with the data stored in the
 * `*-backup-2023.05.31.json` data files for checkins and user. These files
 * are syncs of Untappd data accurate up to May 31, 2023 (it should be 5570
 * checkins total).
 */

/* eslint-disable no-console */

import fs from 'fs';
import dotenv from 'dotenv';
import { UntappdClient, SupabaseClient } from '../src/lib/index.js';
import { Mapper } from '../src/utils/index.js';

const DATA_FILE_PATH = './data/checkins-trunc.json';

dotenv.config();

(async () => {
  const supabase = new SupabaseClient();
  const seedUser = async () => {
    const client = new UntappdClient();
    client.setToken(process.env.UNTAPPD_ACCESS_TOKEN);
    const user = await client.getUser();
    const payload = Mapper.user(user);

    await supabase.addUser(payload);
    console.log('User added.');
  };

  // const seedCheckins = async () => {
  //   await fs.readFile(DATA_FILE_PATH, async (err, data) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }

  //     const json = JSON.parse(data.toString());
  //     const checkins = json?.checkins;

  //     if (!checkins) {
  //       console.log('No checkins to add.');
  //       return;
  //     }

  //     const mappedCheckins = checkins.map(Mapper.checkin);
  //     console.log(`Adding ${mappedCheckins.length} checkins...`);

  //     // const totalAdded = await tigris.addCheckins(mappedCheckins);
  //     // console.log(`${totalAdded} checkins added.`);

  //     // const addedBreweries = await tigris.updateBreweries();
  //     // console.log(`${addedBreweries} breweries added.`);
  //   });
  // };

  try {
    await seedUser();
    // await seedCheckins();
  } catch (error) {
    console.error('[Error in scripts/seed.ts]', error);
  }
})();
