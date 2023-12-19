import dotenv from 'dotenv';
import SupabaseClient from '../src/lib/SupabaseClient.ts';
import { getArg } from './utils/getArg.ts';
import { promptUser } from './utils/promptUser.ts';
import { recalculateTotals } from './utils/recalculateTotals.ts';

dotenv.config();

const supabase = new SupabaseClient();
supabase.CHECKINS_PER_PAGE = 1000;

function getArrayArg(arg: string): string[] {
  const argValue = getArg(arg);

  if (!argValue) {
    return [];
  }

  return argValue.split(',').map(x => x.trim());
}

(async () => {
  const refreshCheckins = getArrayArg('checkins');
  const refreshBeers = getArrayArg('beers');
  const refreshBreweries = getArrayArg('breweries');
  const refreshVenues = getArrayArg('venues');

  if (refreshCheckins && refreshCheckins.length > 0) {
    const allCheckins = await Promise.all(
      refreshCheckins.map(id => supabase.getCheckinById(parseInt(id))),
    );

    const validCheckins = allCheckins.filter(x => x !== null);
    refreshBeers.push(...validCheckins.map(ch => ch.beer.toString()));
    refreshBreweries.push(...validCheckins.map(ch => ch.brewery.toString()));
    refreshVenues.push(...validCheckins.filter(ch => ch.venue).map(ch => ch.venue.toString()));
  }

  if (refreshBeers.length === 0 && refreshBreweries.length === 0 && refreshVenues.length === 0) {
    const promptDoAll = await promptUser('Are you sure you want to refresh all? (Y/n) ');
    if (promptDoAll !== 'Y') {
      console.log('Exiting.');
      process.exit(1);
    }
  }

  try {
    await recalculateTotals({
      beerIds: refreshBeers,
      breweryIds: refreshBreweries,
      venueIds: refreshVenues,
    });
  } catch (error) {
    console.error('Something went wrong:');
    console.error(error);
  }
})();
