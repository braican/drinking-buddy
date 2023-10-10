import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const tigris = await TigrisClient.create();
    const popularBreweries = await tigris.getMostPopularBreweries();
    return ApiResponse.success({ breweries: popularBreweries });
  } catch (error) {
    console.error('[Error in GET api/breweries/popular]', error);
    return ApiResponse.error(error.message);
  }
}
