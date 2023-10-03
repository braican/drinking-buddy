import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }): Promise<Response> {
  try {
    const query = url.searchParams.get('query');
    const tigris = await TigrisClient.create();
    const results = await tigris.searchBreweryNames(query);
    return ApiResponse.success({ results });
  } catch (error) {
    console.error('[Error in GET api/breweries/search]', error);
    return ApiResponse.error(error.message);
  }
}
