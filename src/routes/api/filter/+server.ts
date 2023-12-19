import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';
import type { CheckinWithData, Brewery, BeerWithData } from '@types';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');

    const supabase = new SupabaseClient();
    supabase.CHECKINS_PER_PAGE = 1000;
    const checkins: CheckinWithData[] = [];
    let page = 1;

    const initialFetch = await supabase.getFilteredCheckins({ style, state });
    checkins.push(...initialFetch.checkins);

    // Keep fetching checkins in this filter until we have the right number.
    while (checkins.length < initialFetch.count) {
      page += 1;
      const nextPageFetch = await supabase.getFilteredCheckins({ style, state }, page);
      checkins.push(...nextPageFetch.checkins);
    }

    const ratedCheckins = checkins.filter(ch => ch.rating);
    const beerMap: { [id: number]: Partial<BeerWithData> } = {};
    const breweryMap: { [slug: string]: Partial<Brewery> & { rated_hads: number } } = {};

    checkins.forEach(ch => {
      const { beer, brewery } = ch;

      const checkinData: BeerWithData['checkins'][0] = {
        date: ch.created_at,
        rating: ch.rating,
      };

      // Beer map.
      if (!beerMap[beer.id]) {
        beerMap[beer.id] = {
          ...beer,
          brewery,
          last_had: ch.created_at,
          checkins: [checkinData],
        };
      } else {
        beerMap[beer.id].checkins = [...beerMap[beer.id].checkins, checkinData].sort((a, b) =>
          a.date > b.date ? -1 : 1,
        );
      }

      // Brewery map
      if (!breweryMap[brewery.id]) {
        breweryMap[brewery.id] = {
          ...brewery,
          hads: 1,
          rated_hads: ch.rating ? 1 : 0,
          total_rating: ch.rating,
        };
      } else {
        breweryMap[brewery.id].hads += 1;
        breweryMap[brewery.id].rated_hads += ch.rating ? 1 : 0;
        breweryMap[brewery.id].total_rating += ch.rating;
      }
    });

    const beers = Object.values(beerMap).sort((a, b) => b.average - a.average);
    const breweries = Object.values(breweryMap)
      .map(brewery => ({
        ...brewery,
        beers: beers.filter(beer => beer.brewery.id === brewery.id),
        average: brewery.total_rating / brewery.rated_hads,
      }))
      .sort((a, b) => {
        if ((!a.average && !b.average) || !a.average) {
          return 1;
        }
        if (!b.average) {
          return -1;
        }

        return b.average - a.average;
      });

    return ApiResponse.success({
      beers,
      breweries,
      filteredAverage: (
        ratedCheckins.reduce((total, ch) => total + ch.rating, 0) / ratedCheckins.length
      ).toFixed(2),
    });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
