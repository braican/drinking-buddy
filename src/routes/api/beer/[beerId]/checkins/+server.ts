import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params }) {
  try {
    const beerId = params.beerId;
    const supabase = new SupabaseClient();
    const checkins = await supabase.getBeerCheckins(beerId);

    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/beer/<beerId>/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
