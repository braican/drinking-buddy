import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();
    const checkins = await tigris.getBeerCheckins(slug);

    if (checkins.length < 1) {
      throw error(404);
    }

    return json({
      success: true,
      data: [...checkins],
    });
  } catch (e) {
    if (e && e.status === 404) {
      throw error(404, {
        message: 'Not found',
      });
    }

    console.error('[Error in GET api/beer]', e);
    return json({
      success: false,
      message: e.message,
    });
  }
}
