import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const checkins = await tigris.getBeerCheckins(slug);

    if (checkins.length < 1) {
      return ApiResponse.error('Beer not found.', 404);
    }

    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/beer/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
