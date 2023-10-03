import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const tigris = await TigrisClient.create();
    const bestBreweries = await tigris.getBestBreweries();
    return ApiResponse.success({ breweries: bestBreweries });
  } catch (error) {
    console.error('[Error in GET api/breweries/best]', error);
    return ApiResponse.error(error.message);
  }
}
