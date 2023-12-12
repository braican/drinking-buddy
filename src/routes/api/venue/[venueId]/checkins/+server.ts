import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params, url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const beerId = params.venueId;
    const supabase = new SupabaseClient();
    const { checkins, count } = await supabase.getVenueCheckins(beerId, parseInt(page));

    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/beer/<beerId>/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
