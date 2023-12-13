import { SupabaseClient } from '@lib';
import { Mapper, ApiResponse, incrementRecord } from '@utils';
import type { Beer, Brewery, UntappdCheckinData, Venue } from '@types';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { newCheckins }: { newCheckins: UntappdCheckinData[] } = await request.json();
    const supabase = new SupabaseClient();

    if (!newCheckins || !newCheckins.length) {
      return ApiResponse.error('No checkins to add.');
    }

    const insertCheckins = [];
    const insertBeers: { [id: number]: Beer } = {};
    const insertBreweries: { [id: number]: Brewery } = {};
    const insertVenues: { [id: number]: Venue } = {};

    newCheckins.forEach(ch => {
      const checkin = Mapper.checkin(ch);
      insertCheckins.push(checkin);

      const beer = Mapper.beer(ch);
      const brewery = Mapper.brewery(ch);
      const venue = Mapper.venue(ch);

      insertBeers[beer.id] = incrementRecord<Beer>(insertBeers[beer.id], beer, checkin);
      if (!insertBeers[beer.id].last_had || insertBeers[beer.id].last_had < checkin.created_at) {
        insertBeers[beer.id].last_had = checkin.created_at;
      }

      insertBreweries[brewery.id] = incrementRecord<Brewery>(
        insertBreweries[brewery.id],
        brewery,
        checkin,
      );

      if (venue) {
        insertVenues[venue.id] = incrementRecord<Venue>(insertVenues[venue.id], venue, checkin);
      }
    });

    type ItemType = Beer | Brewery | Venue;
    const processData = async (
      items: ItemType[],
      getFn: (ids: number[]) => Promise<ItemType[]>,
      addFn: (items: ItemType[]) => Promise<void>,
    ) => {
      try {
        const existingItems = await getFn(items.map(item => item.id));

        const newItems: ItemType[] = [...existingItems, ...items].reduce((accumulator, current) => {
          const existingItem = accumulator.find(item => item.id === current.id);
          if (existingItem) {
            existingItem.hads = existingItem.hads + current.hads;
            existingItem.rated_hads = existingItem.rated_hads + current.rated_hads;
            existingItem.total_rating = existingItem.total_rating + current.total_rating;
            existingItem.average = existingItem.total_rating / existingItem.hads;
          } else {
            accumulator.push({ ...current });
          }

          return accumulator;
        }, []);

        await addFn(newItems);
      } catch (error) {
        console.error(error);
        throw new Error('Error incrementing item');
      }
    };

    await processData(
      Object.values(insertBreweries),
      supabase.getBreweriesById.bind(supabase),
      supabase.addBreweries.bind(supabase),
    );
    await processData(
      Object.values(insertVenues),
      supabase.getVenuesById.bind(supabase),
      supabase.addVenues.bind(supabase),
    );
    await processData(
      Object.values(insertBeers),
      supabase.getBeersById.bind(supabase),
      supabase.addBeers.bind(supabase),
    );

    await supabase.addCheckins(insertCheckins);

    return ApiResponse.success({ totalAdded: insertCheckins.length });
  } catch (error) {
    console.error('[Error in POST api/checkins/add]', error);
    return ApiResponse.error(error.message);
  }
}
