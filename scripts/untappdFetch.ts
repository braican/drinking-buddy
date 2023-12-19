import dotenv from 'dotenv';
import UntappdClient from '../src/lib/UntappdClient.ts';
import Mapper from '../src/utils/Mapper.ts';
import type { UntappdUserCheckinsResponse } from '@types';

dotenv.config();

const args: string[] = process.argv.slice(2);

// Check that there is at least one argument
if (args.length < 1) {
  console.error('\nEndpoint is required.\nUsage: scripts/untappdFetch.ts <endpoint>');
  process.exit(1); // Exit with an error code
}
const endpoint = args[0];

// Parse optional --query flag
let queryArgs: object | undefined;

try {
  const queryIndex = args.indexOf('--query');
  if (queryIndex !== -1 && queryIndex < args.length - 1) {
    // '--query' is present and followed by a value
    queryArgs = JSON.parse(args[queryIndex + 1]);
  }
} catch (err) {
  console.error('Invalid --query flag value.');
}

(async () => {
  const client = new UntappdClient();
  client.setToken(process.env.UNTAPPD_ACCESS_TOKEN);
  const response = await client.genericRequest<UntappdUserCheckinsResponse>(endpoint, queryArgs);

  console.log(response.response.checkins.items);
})();
