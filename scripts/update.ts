/**
 * This script can be used to update the database with the latest checkins.
 */

/* eslint-disable no-console */

import { Tigris, FindQueryOptions } from '@tigrisdata/core';
import UntappdClient from '../util/UntappdClient.ts';
import type { Checkin } from '../db/models/checkin';

const getCheckinData = async () => {
  const tigrisClient = new Tigris();
  const db = await tigrisClient.getDatabase();
  const checkinCollection = db.getCollection<Checkin>('checkins');

  const count = await checkinCollection.count();
  const lastCheckin = await checkinCollection.findOne({
    sort: {
      field: 'createdAt',
      order: '$desc',
    },
    options: new FindQueryOptions(1, 0),
  });

  return { count, lastCheckin };
};

(async () => {
  try {
    const client = new UntappdClient();
    const user = await client.getUser();
    const { lastCheckin, count } = await getCheckinData();

    console.log("Here's the deal:");
    console.log('Realtime user checkins:', user.stats.total_checkins);
    console.log('Logged checkin count:', count);
    console.log(`Fetching most recent ${user.stats.total_checkins - count}`);
  } catch (e) {
    console.error('error', e);
  }
})();
