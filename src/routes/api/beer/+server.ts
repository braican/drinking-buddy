import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const supabase = new SupabaseClient();
    const beer = await supabase.getBeer(slug);

    if (!beer) {
      return ApiResponse.error('Beer not found.', 404);
    }

    return ApiResponse.success({ beer });
  } catch (error) {
    console.error('[Error in GET api/beer]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
