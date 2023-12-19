import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const supabase = new SupabaseClient();
    const brewery = await supabase.getBrewery({ slug });

    if (!brewery) {
      return ApiResponse.error('Brewery not found.', 404);
    }

    return ApiResponse.success({ brewery });
  } catch (error) {
    console.error('[Error in GET api/brewery]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
