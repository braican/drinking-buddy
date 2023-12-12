import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params, url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const breweryId = params.breweryId;
    const supabase = new SupabaseClient();
    const { checkins, count } = await supabase.getBreweryCheckins(breweryId, parseInt(page));

    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/brewery/<breweryId>/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
