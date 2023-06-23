import { Tigris } from '@tigrisdata/core';
import { Checkin } from '../db/models/checkin';
import { User } from '../db/models/users';

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
    console.error(e);
    process.exit(1);
  });
