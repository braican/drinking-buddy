#!/usr/bin/env ts-node

/**
 * This script can be used to get all styles.
 */

/* eslint-disable no-console */
import { TigrisClient } from '../src/lib/index.js';
import fs from 'fs';

(async () => {
  try {
    console.log('Fetching styles...');
    const tigris = await TigrisClient.create();
    const styles = await tigris.getStyles();

    fs.writeFile('./data/styles.txt', styles.join('\n'), err => {
      if (err) {
        console.log(err);
      } else {
        console.log('Styles written successfully to `./data/styles.txt`.');
      }
    });
  } catch (e) {
    console.error('[Error in scripts/get-styles.ts]', e);
  }
})();
