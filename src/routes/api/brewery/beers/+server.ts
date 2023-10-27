import { TigrisClient } from '@lib';
import { ApiResponse, checkinsToBeers } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();

    const checkins = await tigris.getBreweryCheckins(slug);
    const cumulativeRating = checkins.reduce((acc, ch) => (ch.rating ? acc + ch.rating : acc), 0);

    return ApiResponse.success({
      rating: (cumulativeRating / checkins.filter(ch => ch.rating).length).toFixed(2),
      beers: checkinsToBeers(checkins),
      checkinCount: checkins.length,
      checkins,
    });
  } catch (error) {
    console.error('[Error in GET api/brewery/beers]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
