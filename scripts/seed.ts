/**
 * This seed script will seed the Tigris database with the data from the
 * `checkins-backup-2023.05.31.json` data file, which has all checkins up until
 *  that point in time (it should be 5570 checkins total).
 */


import { Tigris } from '@tigrisdata/core';
import fs from 'fs';

const path = './data/checkins.json';

fs.readFile(path, async (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const json = JSON.parse(data.toString());
  const checkins = json?.checkins;

  if (!checkins) {
    console.log('No checkins.');
    return;
  }

  const mappedCheckins = checkins.map(ch => ({
    id: ch.checkin_id,
    createdAt: new Date(ch.created_at),
    comment: ch.checkin_comment,
    rating: ch.rating_score,
    beer: {
      id: ch.beer.bid,
      name: ch.beer.beer_name,
      label: ch.beer.beer_label,
      style: ch.beer.beer_style,
      abv: ch.beer.beer_abv,
    },
    brewery: {
      id: ch.brewery.brewery_id,
      name: ch.brewery.brewery_name,
      type: ch.brewery.brewery_type,
      label: ch.brewery.brewery_label,
      city: ch.brewery.location.brewery_city,
      state: ch.brewery.location.brewery_state,
      country: ch.brewery.country_name,
      lat: ch.brewery.location.lat,
      lng: ch.brewery.location.lng,
    },
    venue: Array.isArray(ch.venue) ? null : {
      id: ch.venue.venue_id,
      name: ch.venue.venue_name,
      address: ch.venue.location.venue_address,
      city: ch.venue.location.venue_city,
      state: ch.venue.location.venue_state,
      country: ch.venue.location.venue_country,
      lat: ch.venue.location.lat,
      lng: ch.venue.location.lng,
    },
    raw: JSON.stringify(ch),
  }));

  const tigrisClient = new Tigris();
  const db = await tigrisClient.getDatabase();
  const checkinCollection = db.getCollection('checkins');
  let totalAdded = 0;

  console.log(`Adding ${mappedCheckins.length} checkins...`);

  for (let i = 0; i < mappedCheckins.length; i += 200) {
    const batch = mappedCheckins.slice(i, i + 200);
    const insertedCheckins = await checkinCollection.insertOrReplaceMany(batch);
    totalAdded += insertedCheckins.length;
    console.log(`Batch ${(i + 200) / 200} / ${Math.ceil(mappedCheckins.length / 200)} inserted.`);

  }

  console.log(`${totalAdded} added.`);

});