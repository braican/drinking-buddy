import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params, url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const beerId = params.venueId;
    const supabase = getSupabase();
    const { checkins, count } = await supabase.getVenueCheckins(beerId, parseInt(page));

    setHeaders({ 'cache-control': 'private, max-age=300' });
    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/beer/<beerId>/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
