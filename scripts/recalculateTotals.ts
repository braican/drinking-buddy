import dotenv from 'dotenv';
import SupabaseClient from '../src/lib/SupabaseClient.ts';
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

function promptUser(question: string): Promise<string> {
  return new Promise(resolve => {
    process.stdout.write(question);

    process.stdin.once('data', data => {
      const answer = data.toString().trim();
      resolve(answer);
    });
  });
}

// Parse command line arguments
const args = process.argv.slice(2);

const beersIndex = args.indexOf('--beers');
const breweriesIndex = args.indexOf('--breweries');
const venuesIndex = args.indexOf('--venues');
const checkinsIndex = args.indexOf('--checkins');
const argBeerIds =
  beersIndex !== -1 && beersIndex < args.length - 1
    ? args[beersIndex + 1].split(',').map(x => x.trim())
    : [];
const argBreweryIds =
  breweriesIndex !== -1 && breweriesIndex < args.length - 1
    ? args[breweriesIndex + 1].split(',').map(x => x.trim())
    : [];
const argVenueIds =
  venuesIndex !== -1 && venuesIndex < args.length - 1
    ? args[venuesIndex + 1].split(',').map(x => x.trim())
    : [];
const argCheckinsIndex =
  checkinsIndex !== -1 && checkinsIndex < args.length - 1
    ? args[checkinsIndex + 1].split(',').map(x => x.trim())
    : [];

console.log('\n');

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

(async () => {
  if (argCheckinsIndex && argCheckinsIndex.length > 0) {
    const allCheckins = await Promise.all(
      argCheckinsIndex.map(id => supabase.getCheckinById(parseInt(id))),
    );

    const validCheckins = allCheckins.filter(x => x !== null);
    argBeerIds.push(...validCheckins.map(ch => ch.beer.toString()));
    argBreweryIds.push(...validCheckins.map(ch => ch.brewery.toString()));
    argVenueIds.push(...validCheckins.filter(ch => ch.venue).map(ch => ch.venue.toString()));
  }

  if (argBeerIds.length === 0 && argBreweryIds.length === 0 && argVenueIds.length === 0) {
    const promptDoAll = await promptUser('Are you sure you want to refresh all? (Y/n) ');
    if (promptDoAll !== 'Y') {
      console.log('Exiting.');
      process.exit(1);
    }
  }

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

  if (argBeerIds.length > 0) {
    try {
      console.log('Updating beers...');

      const toUpdate = [];
      argBeerIds.forEach(id => {
        toUpdate.push(beers[parseInt(id)]);
      });

      await supabase.addBeers(toUpdate);
    } catch (e) {
      console.error('Error updating beer records:', e);
    }
  }

  if (argBreweryIds.length > 0) {
    try {
      console.log('Updating breweries...');
      const toUpdate = [];
      argBreweryIds.forEach(id => {
        toUpdate.push(breweries[parseInt(id)]);
      });

      await supabase.addBreweries(toUpdate);
    } catch (e) {
      console.error('Error updating brewery records:', e);
    }
  }

  if (argVenueIds.length > 0) {
    try {
      const toUpdate = [];
      argVenueIds.forEach(id => {
        toUpdate.push(venues[parseInt(id)]);
      });

      await supabase.addVenues(toUpdate);
    } catch (e) {
      console.error('Error updating venue records:', e);
    }
  }
})();
