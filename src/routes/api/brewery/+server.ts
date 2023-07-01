import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const tigris = await TigrisClient.create();

    const [brewery, checkins] = await Promise.all([
      tigris.getBrewery(slug),
      tigris.getBreweryCheckins(slug),
    ]);

    let cumulative = 0;
    const beers = {};

    checkins.forEach(ch => {
      const beer = ch.beer;
      const checkinData = {
        date: ch.createdAt,
        rating: ch.rating,
      };

      cumulative += ch.rating;

      if (!beers[beer.id]) {
        beers[beer.id] = {
          ...beer,
          lastHad: ch.createdAt,
          checkins: [checkinData],
        };
      } else {
        beers[beer.id] = {
          checkins: beers[beer.id].checkins.push(checkinData),
          ...beers[beer.id],
        };
      }
    });

    return json({
      success: true,
      data: {
        ...brewery,
        rating: (cumulative / checkins.length).toFixed(2),
        beers,
        checkinCount: checkins.length,
        checkins,
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
