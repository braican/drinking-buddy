import { TigrisClient } from '@lib';
import { ApiResponse, checkinsToBeers } from '@utils';

interface BreweryMap {
  [key: string]: {
    slug: string;
    name: string;
    beers: number;
    cumulativeRating: number;
    averageRating?: number;
  };
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const tigris = await TigrisClient.create();

    const checkins = await tigris.getFilteredCheckins(style, state);

    const breweryMap: BreweryMap = {};

    checkins.forEach(ch => {
      const brewery = ch.brewery;

      if (!breweryMap[brewery.id]) {
        breweryMap[brewery.id] = {
          slug: brewery.slug,
          name: brewery.name,
          beers: 1,
          cumulativeRating: ch.rating,
        };
      } else {
        breweryMap[brewery.id].beers += 1;
        breweryMap[brewery.id].cumulativeRating += ch.rating;
      }
    });

    const breweries = Object.values(breweryMap)
      .map(brewery => ({
        ...brewery,
        averageRating: parseFloat((brewery.cumulativeRating / brewery.beers).toFixed(2)),
      }))
      .sort((a, b) => b.averageRating - a.averageRating);

    return ApiResponse.success({ checkins: checkins, beers: checkinsToBeers(checkins), breweries });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
