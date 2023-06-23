/**
 * This script can be used to update the database with the latest checkins.
 */

/* eslint-disable no-console */
import { UntappdClient, TigrisClient } from '../util';

(async () => {
  try {
    const tigris = await TigrisClient.create();
    const untappd = new UntappdClient();
    const user = await untappd.getUser();
    const lastDbCheckin = await tigris.getLastCheckin();
    const dbCheckinCount = await tigris.getCheckinCount();

    console.log('Updating...');
    console.log('Realtime user checkins (from Untappd):', user.stats.total_checkins);
    console.log('Checkins in database:', dbCheckinCount);
    console.log(`Fetching ${user.stats.total_checkins - dbCheckinCount} checkins...`);

    const newCheckins = await untappd.getCheckins(lastDbCheckin.id);
    const totalAdded = await tigris.addCheckins(newCheckins);
    console.log(`${totalAdded} added.`);
  } catch (e) {
    console.error('[Error in scripts/update.ts]', e);
  }
})();
