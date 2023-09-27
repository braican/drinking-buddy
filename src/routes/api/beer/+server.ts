import { json, error } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const checkin = await tigris.getFirstBeerCheckin(slug);

    if (!checkin) {
      throw error(404, 'Beer not found.');
    }

    const beer = checkin.beer;
    const brewery = checkin.brewery;

    return json({
      success: true,
      data: {
        beer,
        brewery,
      },
    });
  } catch (error) {
    console.error('[Error in GET api/beer]', error);
    return json({
      success: false,
      message: error.body.message,
      status: error.status,
    });
  }
}
