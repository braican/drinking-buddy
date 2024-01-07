import { SupabaseClient } from '@lib';
import { ApiResponse, mapCheckins } from '@utils';
import type { CheckinWithData } from '@types';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const year = url.searchParams.get('year');

    const supabase = new SupabaseClient();
    supabase.CHECKINS_PER_PAGE = 1000;
    const checkins: CheckinWithData[] = [];
    let page = 1;

    const initialFetch = await supabase.getFilteredCheckins({ style, state, year });
    checkins.push(...initialFetch.checkins);

    // Keep fetching checkins in this filter until we have the right number.
    while (checkins.length < initialFetch.count) {
      page += 1;
      const nextPageFetch = await supabase.getFilteredCheckins({ style, state, year }, page);
      checkins.push(...nextPageFetch.checkins);
    }

    const ratedCheckins = checkins.filter(ch => ch.rating);
    const { beers, breweries } = mapCheckins(checkins);

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
