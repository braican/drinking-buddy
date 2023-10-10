import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const tigris = await TigrisClient.create();
    const checkins = await tigris.getLatestCheckins();
    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/checkins/latest]', error);
    return ApiResponse.error(error.message);
  }
}
