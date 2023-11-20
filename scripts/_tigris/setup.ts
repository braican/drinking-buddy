import { Tigris } from '@tigrisdata/core';
import { Checkin, User, Brewery } from '../db/models/index.js';

async function main() {
  const tigrisClient = new Tigris();
  await tigrisClient.getDatabase().initializeBranch();
  await tigrisClient.registerSchemas([Checkin, User, Brewery]);
}

main()
  .then(async () => {
    // eslint-disable-next-line
    console.log('Setup complete ...');
    process.exit(0);
  })
  .catch(async e => {
    console.error('[Error in scripts/setup.ts]', e);
    process.exit(1);
  });