import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }): Promise<Response> {
  try {
    const query = url.searchParams.get('query');
    const supabase = new SupabaseClient();
    const results = await supabase.search(query);

    const breweryResults = [];
    const beerResults = [];

    results.forEach(result => {
      if (result.table_name === 'breweries') {
        breweryResults.push(result);
      } else {
        beerResults.push(result);
      }
    });

    return ApiResponse.success({ breweryResults, beerResults });
  } catch (error) {
    console.error('[Error in GET api/breweries/search]', error);
    return ApiResponse.error(error.message);
  }
}
