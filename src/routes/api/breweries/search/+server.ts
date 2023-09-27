import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }): Promise<Response> {
  try {
    const query = url.searchParams.get('query');
    const tigris = await TigrisClient.create();
    const results = await tigris.searchBreweryNames(query);

    return json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error('[Error in GET api/breweries/search]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}
