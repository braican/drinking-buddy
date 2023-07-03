import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const brewery = await tigris.getBrewery(slug);

    return json({
      success: true,
      data: {
        brewery,
      },
    });
  } catch (error) {
    console.error('[Error in GET api/brewery]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}
