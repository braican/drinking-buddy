import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const supabase = new SupabaseClient();
    const bestBreweries = await supabase.getBestBreweries();
    return ApiResponse.success({ breweries: bestBreweries });
  } catch (error) {
    console.error('[Error in GET api/breweries/best]', error);
    return ApiResponse.error(error.message);
  }
}
