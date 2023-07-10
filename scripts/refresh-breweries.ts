/**
 * This seed script will seed the Tigris database with the data from the `backup-2023.05.31.json`
 * data files for checkins and user. Both these files are syncs of Untappd data accurate up to May
 * 31, 2023 (it should be 5570 checkins total).
 */

/* eslint-disable no-console */

import { TigrisClient } from '../src/lib/index.js';

(async () => {
  const tigris = await TigrisClient.create();
  try {
    await tigris.updateBreweries();
  } catch (error) {
    console.error('[Error]', error);
  }
})();
