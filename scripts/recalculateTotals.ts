import dotenv from 'dotenv';
import SupabaseClient from '../src/lib/SupabaseClient.ts';
import { getArg } from './utils/getArg.ts';
import { promptUser } from './utils/promptUser.ts';
import type { CheckinWithData, Beer, Brewery, Venue } from '@types';

dotenv.config();

const supabase = new SupabaseClient();
supabase.CHECKINS_PER_PAGE = 1000;

type PartialTypes = Partial<Beer> | Partial<Brewery> | Partial<Venue>;
function incrementRecord(record: PartialTypes, id: number, checkin: CheckinWithData): PartialTypes {
  const rating = checkin.rating;
  const newHads = record ? record.hads + 1 : 1;
  const newRatedHads = record ? record.rated_hads + (rating ? 1 : 0) : rating ? 1 : 0;
  const totalRating = record ? record.total_rating + rating : rating;
  const average = totalRating / newRatedHads;

  return {
    id,
    hads: newHads,
    rated_hads: newRatedHads,
    total_rating: totalRating,
    average,
  };
}

async function getAllCheckins(): Promise<CheckinWithData[]> {
  const checkins: CheckinWithData[] = [];

  try {
    const initialFetch = await supabase.getCheckins();
    const totalPages = Math.ceil(initialFetch.count / supabase.CHECKINS_PER_PAGE);
    let page = 1;
    let progress = 0;

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      `[${'='.repeat(page)}${' '.repeat(totalPages - page)}] ${progress.toFixed(2)}%`,
    );

    checkins.push(...initialFetch.checkins);

    while (checkins.length < initialFetch.count) {
      page += 1;
      const nextPageFetch = await supabase.getCheckins(page);
      checkins.push(...nextPageFetch.checkins);

      progress = (page / totalPages) * 100;
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(
        `[${'='.repeat(page)}${' '.repeat(totalPages - page)}] ${progress.toFixed(2)}%`,
      );
    }

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  } catch (e) {
    console.error('Error getting all checkins:', e);
  }

  return checkins;
}

type RecalculateTotalsArgs = {
  beerIds: string[];
  breweryIds: string[];
  venueIds: string[];
};
async function recalculateTotals({ beerIds, breweryIds, venueIds }: RecalculateTotalsArgs) {
  console.log('Fetching all checkins...');
  const checkins: CheckinWithData[] = await getAllCheckins();
  console.log(`Fetched ${checkins.length} checkins.`);

  const beers: { [id: number]: Partial<Beer> } = {};
  const breweries: { [id: number]: Partial<Brewery> } = {};
  const venues: { [id: number]: Partial<Venue> } = {};

  checkins.forEach(ch => {
    const beer = ch.beer;
    const brewery = ch.brewery;
    const venue = ch.venue;

    beers[beer.id] = incrementRecord(beers[beer.id], beer.id, ch);
    if (!beers[beer.id].last_had || beers[beer.id].last_had < ch.created_at) {
      beers[beer.id].last_had = ch.created_at;
    }

    breweries[brewery.id] = incrementRecord(breweries[brewery.id], brewery.id, ch);

    if (venue) {
      venues[venue.id] = incrementRecord(venues[venue.id], venue.id, ch);
    }
  });

  console.log('Updating records...');

  if (beerIds && beerIds.length > 0) {
    try {
      console.log('Updating beers...');
      await supabase.addBeers(beerIds.map(id => beers[parseInt(id)]));
    } catch (e) {
      console.error('Error updating beer records:', e);
    }
  }

  if (breweryIds && breweryIds.length > 0) {
    try {
      console.log('Updating breweries...');
      await supabase.addBreweries(breweryIds.map(id => breweries[parseInt(id)]));
    } catch (e) {
      console.error('Error updating brewery records:', e);
    }
  }

  if (venueIds && venueIds.length > 0) {
    try {
      console.log('Updating venues...');
      await supabase.addVenues(venueIds.map(id => venues[parseInt(id)]));
    } catch (e) {
      console.error('Error updating venue records:', e);
    }
  }
}

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
