import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const supabase = new SupabaseClient();

    const [bestBreweries, popularBreweries] = await Promise.all([
      supabase.getBestBreweries(),
      supabase.getMostPopularBreweries(),
    ]);

    return ApiResponse.success({ bestBreweries, popularBreweries });
  } catch (error) {
    console.error('[Error in GET api/stats]', error);
    return ApiResponse.error(error.message);
  }
}
