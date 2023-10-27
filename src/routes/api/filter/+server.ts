import { TigrisClient } from '@lib';
import { ApiResponse, checkinsToBeers } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const tigris = await TigrisClient.create();

    const checkins = await tigris.getFilteredCheckins(style, state);

    return ApiResponse.success({ checkins: checkins, beers: checkinsToBeers(checkins) });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
