import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params }) {
  try {
    const breweryId = params.breweryId;
    const supabase = new SupabaseClient();
    const beers = await supabase.getBreweryBeers(breweryId);

    return ApiResponse.success({ beers });
  } catch (error) {
    console.error('[Error in GET api/brewery/<breweryId>/beers]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
