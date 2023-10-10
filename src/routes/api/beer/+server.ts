import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const checkin = await tigris.getFirstBeerCheckin(slug);

    if (!checkin) {
      return ApiResponse.error('Beer not found.', 404);
    }

    const beer = checkin.beer;
    const brewery = checkin.brewery;

    return ApiResponse.success({ beer, brewery });
  } catch (error) {
    console.error('[Error in GET api/beer]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
