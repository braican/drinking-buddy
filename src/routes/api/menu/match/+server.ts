import SupabaseClient from '@lib/SupabaseClient';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { beerNames, breweryId } = await request.json();

    if (!beerNames || !Array.isArray(beerNames) || beerNames.length === 0) {
      return ApiResponse.error('No beer names provided.', 400);
    }

    const supabase = new SupabaseClient();
    const matches = await supabase.findBeersByNames(beerNames, breweryId);

    return ApiResponse.success({ matches });
  } catch (error) {
    console.error('[Error in menu match]', error);
    return ApiResponse.error(error.message, 500);
  }
}
