import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params }) {
  try {
    const breweryId = params.breweryId;
    const supabase = new SupabaseClient();
    const checkins = await supabase.getBreweryCheckins(breweryId);

    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/brewery/beers]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
