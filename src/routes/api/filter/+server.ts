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

    const initialFetch = await supabase.getFilteredCheckins({ style, state, year });
    const checkins: CheckinWithData[] = [...initialFetch.checkins];

    if (checkins.length < initialFetch.count) {
      const totalPages = Math.ceil(initialFetch.count / supabase.CHECKINS_PER_PAGE);
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const remaining = await Promise.all(
        remainingPages.map(p => supabase.getFilteredCheckins({ style, state, year }, p)),
      );
      checkins.push(...remaining.flatMap(r => r.checkins));
    }

    const ratedCheckins = checkins.filter(ch => ch.rating);
    const { beers, breweries } = mapCheckins(checkins);

    setHeaders({ 'cache-control': 'private, max-age=300' });
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
