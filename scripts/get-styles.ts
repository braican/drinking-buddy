#!/usr/bin/env ts-node

/**
 * This script can be used to get all styles.
 */

/* eslint-disable no-console */
import { TigrisClient } from '../src/lib/index.js';

(async () => {
  try {
    const tigris = await TigrisClient.create();

    console.log('Fetching styles...');

    const styles = await tigris.getStyles();
    console.log(styles);
  } catch (e) {
    console.error('[Error in scripts/get-styles.ts]', e);
  }
})();
