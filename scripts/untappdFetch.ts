import dotenv from 'dotenv';
import UntappdClient from '../src/lib/UntappdClient.ts';
import type { UntappdResponse, UntappdUserCheckinsResponse } from '@types';

dotenv.config();

(async () => {
  const args: string[] = process.argv.slice(2);

  // Check if there is exactly one argument
  if (args.length < 1) {
    console.error('Usage: scripts/untappdFetch.ts <endpoint>');
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

  const client = new UntappdClient();
  client.setToken(process.env.UNTAPPD_ACCESS_TOKEN);
  const response = (await client.genericRequest(
    endpoint,
    queryArgs,
  )) as UntappdResponse<UntappdUserCheckinsResponse>;

  console.log(response.response.checkins.items);
})();
