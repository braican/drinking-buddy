import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';
import type { CheckinWithData, Brewery, BeerWithData } from '@types';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');

    const supabase = new SupabaseClient();
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
    const uniqueBeers: { [id: number]: Partial<BeerWithData> } = {};
    const breweryMap: { [slug: string]: Partial<Brewery> } = {};

    ratedCheckins.forEach(ch => {
      const beer = ch.beer;
      const checkinData: BeerWithData['checkins'][0] = {
        date: ch.created_at,
        rating: ch.rating,
      };

      if (!uniqueBeers[ch.id]) {
        uniqueBeers[ch.id] = {
          ...beer,
          brewery: {
            name: ch.brewery.name,
            slug: ch.brewery.slug,
          },
          last_had: ch.created_at,
          checkins: [checkinData],
        };
      } else {
        uniqueBeers[ch.id] = {
          checkins: [...uniqueBeers[ch.id].checkins, checkinData],
          ...uniqueBeers[ch.id],
        };
      }
    });

    ratedCheckins.forEach(ch => {
      const brewery = ch.brewery;

      if (!breweryMap[brewery.slug]) {
        breweryMap[brewery.slug] = {
          ...brewery,
          hads: 1,
          total_rating: ch.rating,
        };
      } else {
        breweryMap[brewery.slug].hads += 1;
        breweryMap[brewery.slug].total_rating += ch.rating;
      }
    });

    const beers = Object.values(uniqueBeers).sort((a, b) => b.average - a.average);
    const breweries = Object.values(breweryMap)
      .map(brewery => ({
        ...brewery,
        beers: beers.filter(beer => beer.brewery.slug === brewery.slug),
        average: parseFloat((brewery.total_rating / brewery.hads).toFixed(2)),
      }))
      .sort((a, b) => b.average - a.average);

    return ApiResponse.success({
      checkins,
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
