import { json, error } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const brewery = await tigris.getBrewery(slug);

    if (!brewery) {
      throw error(404, 'Brewery not found.');
    }

    return json({
      success: true,
      data: {
        ...brewery,
      },
    });
  } catch (error) {
    console.error('[Error in GET api/brewery]', error);
    return json({
      success: false,
      message: error.body.message,
      status: error.status,
    });
  }
}
