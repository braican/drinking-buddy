import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const tigris = await TigrisClient.create();
    const checkins = await tigris.getLatestCheckins();

    return json({
      success: true,
      data: {
        checkins,
      },
    });
  } catch (error) {
    console.error('[Error in GET api/checkins/latest]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}
