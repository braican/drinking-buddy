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
import { Mapper, incrementRecord } from '../src/utils/index.js';
import type { Beer, Brewery, Venue } from '../types/index.js';

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

  const seedCheckins = async () => {
    await fs.readFile(DATA_FILE_PATH, async (err, data) => {
      if (err) {
        throw new Error(err.message);
      }

      const json = JSON.parse(data.toString());
      const checkinData = json?.checkins;

      if (!checkinData) {
        console.log('No checkins to add.');
        return;
      }

      const checkins = [];
      const beers: { [id: number]: Beer } = {};
      const breweries: { [id: number]: Brewery } = {};
      const venues: { [id: number]: Venue } = {};

      checkinData.forEach(ch => {
        const checkin = Mapper.checkin(ch);
        checkins.push(checkin);

        const beer = Mapper.beer(ch);
        const brewery = Mapper.brewery(ch);
        const venue = Mapper.venue(ch);

        beers[beer.id] = incrementRecord<Beer>(beers[beer.id], beer, checkin);

        if (!beers[beer.id].last_had || beers[beer.id].last_had < checkin.created_at) {
          beers[beer.id].last_had = checkin.created_at;
        }

        breweries[brewery.id] = incrementRecord<Brewery>(breweries[brewery.id], brewery, checkin);

        if (venue) {
          venues[venue.id] = incrementRecord<Venue>(venues[venue.id], venue, checkin);
        }
      });

      console.log(`Adding ${checkins.length} checkins...`);

      await supabase.addBreweries(Object.values(breweries));
      console.log(`${Object.values(breweries).length} breweries added.`);

      await supabase.addVenues(Object.values(venues));
      console.log(`${Object.values(venues).length} venues added.`);

      await supabase.addBeers(Object.values(beers));
      console.log(`${Object.values(beers).length} beers added.`);

      await supabase.addCheckins(checkins);
      console.log(`${checkins.length} checkins added.`);
    });
  };

  try {
    // await seedUser();
    await seedCheckins();
  } catch (error) {
    console.error('[Error in scripts/seed.ts]', error);
  }
})();
