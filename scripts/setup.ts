import { Tigris } from '@tigrisdata/core';
import { Checkin, User } from '../db/models/index.ts';

async function main() {
  const tigrisClient = new Tigris();
  await tigrisClient.getDatabase().initializeBranch();
  await tigrisClient.registerSchemas([Checkin, User]);
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
