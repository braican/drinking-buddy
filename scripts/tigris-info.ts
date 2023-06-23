/**
 * This script can be used to update the database with the latest checkins.
 */

/* eslint-disable no-console */
import { TigrisClient } from '../util';

(async () => {
  try {
    const tigris = await TigrisClient.create();

    console.log('Tigris database info...');

    const lastDbCheckin = await tigris.getLastCheckin();
    const dbCheckinCount = await tigris.getCheckinCount();

    console.log('Checkins in database:', dbCheckinCount);
    console.log('Last checkin:', lastDbCheckin);
  } catch (e) {
    console.error('[Error in scripts/tigris-info.ts]', e);
  }
})();
