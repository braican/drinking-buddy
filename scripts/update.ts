/**
 * This script can be used to update the database with the latest checkins.
 */

/* eslint-disable no-console */

import { Tigris, FindQueryOptions } from '@tigrisdata/core';
import type { Checkin } from '../db/models/checkin';

const getLastCheckin = async () => {
  const tigrisClient = new Tigris();
  const db = await tigrisClient.getDatabase();
  const checkinCollection = db.getCollection<Checkin>('checkins');

  const lastCheckin = await checkinCollection.findOne({
    sort: {
      field: 'createdAt',
      order: '$desc',
    },
    options: new FindQueryOptions(1, 0),
  });

  console.log(lastCheckin);
};

(() => {
  try {
    const lastCheckin = getLastCheckin();
  } catch (e) {
    console.error('error', e);
  }
})();
