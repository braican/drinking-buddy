import { TigrisClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { newCheckins } = await request.json();
    const tigris = await TigrisClient.create();
    const totalAdded = await tigris.addCheckins(newCheckins);
    await tigris.updateBreweries(newCheckins);

    return ApiResponse.success({ totalAdded });
  } catch (error) {
    console.error('[Error in POST api/checkins/add]', error);
    return ApiResponse.error(error.message);
  }
}
