import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';
import type { Brewery } from '@types';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }): Promise<Response> {
  try {
    const timeframe = url.searchParams.get('timeframe') || 'all';
    const supabase = new SupabaseClient();

    let bestBreweries: Brewery[] = [];
    let popularBreweries: Brewery[] = [];

    if (timeframe === 'recent') {
      ({ best: bestBreweries, popular: popularBreweries } = await supabase.getRecentBreweryRankings());
    } else {
      [bestBreweries, popularBreweries] = await Promise.all([
        supabase.getBestBreweries(),
        supabase.getMostPopularBreweries(),
      ]);
    }

    return ApiResponse.success({ bestBreweries, popularBreweries });
  } catch (error) {
    console.error('[Error in GET api/stats]', error);
    return ApiResponse.error(error.message);
  }
}
