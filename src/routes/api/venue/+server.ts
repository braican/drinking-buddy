import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const supabase = new SupabaseClient();
    const venue = await supabase.getVenue(slug);

    if (!venue) {
      return ApiResponse.error('Venue not found.', 404);
    }

    return ApiResponse.success({ venue });
  } catch (error) {
    console.error('[Error in GET api/venue]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
