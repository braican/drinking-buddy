/**
 * Fixes an individual Untappd data discrepancy.
 */

import dotenv from 'dotenv';
import SupabaseClient from '../src/lib/SupabaseClient.ts';
import UntappdClient from '../src/lib/UntappdClient.ts';
import Mapper from '../src/utils/Mapper.ts';
import { recalculateTotals } from './utils/recalculateTotals.ts';
import type { UntappdUserCheckinsResponse } from '@types';

dotenv.config();

const args: string[] = process.argv.slice(2);

// Check that there is at least one argument
if (args.length !== 1) {
  console.error('\nCheckin ID is required.\nUsage: scripts/fixDiscrepancy.ts <checkinId>');
  process.exit(1); // Exit with an error code
}
const checkinId = args[0];

(async () => {
  const supabase = new SupabaseClient();
  const untappd = new UntappdClient();
  untappd.setToken(process.env.UNTAPPD_ACCESS_TOKEN);

  const response = await untappd.genericRequest<UntappdUserCheckinsResponse>(
    '/user/checkins/braican',
    {
      max_id: checkinId,
      limit: 1,
    },
  );

  console.log(`Fixing ${checkinId}...`);

  const realtimeCheckin = response.response?.checkins?.items[0];

  if (!realtimeCheckin) {
    console.log('Checkin not found.');
    process.exit(1);
  }

  const newCheckin = Mapper.checkin(realtimeCheckin);
  const newBeer = Mapper.beer(realtimeCheckin);
  const newBrewery = Mapper.brewery(realtimeCheckin);
  const newVenue = Mapper.venue(realtimeCheckin);

  try {
    const oldCheckin = await supabase.getCheckinById(realtimeCheckin.checkin_id);

    await supabase.addBreweries([newBrewery]);
    await supabase.addVenues([newVenue]);
    await supabase.addBeers([newBeer]);
    await supabase.addCheckins([newCheckin]);

    await recalculateTotals({
      beerIds: [...new Set([newBeer.id.toString(), oldCheckin.beer.toString()])],
      breweryIds: [...new Set([newBrewery.id.toString(), oldCheckin.brewery.toString()])],
      venueIds: [
        ...new Set([newVenue?.id.toString(), oldCheckin.venue?.toString()].filter(x => x)),
      ],
    });
  } catch (error) {
    console.error('Something went wrong:');
    console.error(error);
  }
})();
