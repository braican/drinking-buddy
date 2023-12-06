import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }): Promise<Response> {
  try {
    const query = url.searchParams.get('query');
    // @TODO.
    return ApiResponse.success({});
  } catch (error) {
    console.error('[Error in GET api/breweries/search]', error);
    return ApiResponse.error(error.message);
  }
}
