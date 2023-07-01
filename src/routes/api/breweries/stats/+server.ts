import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const tigris = await TigrisClient.create();
    const { bestBreweries, popularBreweries } = await tigris.getGlobalStats();

    return json({
      success: true,
      data: { bestBreweries, popularBreweries },
    });
  } catch (error) {
    console.error('[Error in GET api/checkins/latest]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}
