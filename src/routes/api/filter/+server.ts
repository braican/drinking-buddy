import { TigrisClient } from '@lib';
import { ApiResponse, checkinsToBeers } from '@utils';
import type { BreweryRecord } from '@app';

interface BreweryMap {
  [key: string]: BreweryRecord;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const tigris = await TigrisClient.create();

    const checkins = await tigris.getFilteredCheckins(style, state);
    const ratedCheckins = checkins.filter(ch => ch.rating);
    const beers = checkinsToBeers(checkins);

    const breweryMap: BreweryMap = {};

    checkins.forEach(ch => {
      const brewery = ch.brewery;

      if (!breweryMap[brewery.id]) {
        breweryMap[brewery.id] = {
          ...brewery,
          beerCount: 1,
          cumulative: ch.rating,
        };
      } else {
        breweryMap[brewery.id].beerCount += 1;
        breweryMap[brewery.id].cumulative += ch.rating;
      }
    });

    const breweries = Object.values(breweryMap)
      .map(brewery => ({
        ...brewery,
        beers: beers.filter(beer => beer.breweryId === brewery.id),
        average: parseFloat((brewery.cumulative / brewery.beerCount).toFixed(2)),
      }))
      .sort((a, b) => b.average - a.average);

    return ApiResponse.success({
      checkins,
      beers,
      breweries,
      filteredAverage: (
        ratedCheckins.reduce((total, ch) => total + ch.rating, 0) / ratedCheckins.length
      ).toFixed(2),
    });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
