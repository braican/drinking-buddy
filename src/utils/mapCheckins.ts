import type { CheckinWithData, BeerWithData, Brewery } from '@types';

/**
 * Map checkins to beers and breweries.
 */
export const mapCheckins = (checkins: CheckinWithData[]): {
  beers: BeerWithData[];
  breweries: Brewery[];
} => {
  const beerMap: { [id: number]: BeerWithData } = {};
  const breweryMap: { [slug: string]: Brewery } = {};

  checkins.forEach(ch => {
    const { beer, brewery } = ch;

    const checkinData: BeerWithData['checkins'][0] = {
      date: ch.created_at,
      rating: ch.rating,
    };

    // Beer map.
    if (!beerMap[beer.id]) {
      beerMap[beer.id] = {
        ...beer,
        brewery,
        last_had: ch.created_at,
        checkins: [checkinData],
      };
    } else {
      beerMap[beer.id].checkins = [...beerMap[beer.id].checkins, checkinData].sort((a, b) =>
        a.date > b.date ? -1 : 1,
      );
    }

    // Brewery map
    if (!breweryMap[brewery.id]) {
      breweryMap[brewery.id] = {
        ...brewery,
        hads: 1,
        rated_hads: ch.rating ? 1 : 0,
        total_rating: ch.rating,
      };
    } else {
      breweryMap[brewery.id].hads += 1;
      breweryMap[brewery.id].rated_hads += ch.rating ? 1 : 0;
      breweryMap[brewery.id].total_rating += ch.rating;
    }
  });

  const beers = Object.values(beerMap).sort((a, b) => b.average - a.average);
  const breweries = Object.values(breweryMap)
    .map(brewery => ({
      ...brewery,
      beers: beers.filter(beer => beer.brewery.id === brewery.id),
      average: brewery.total_rating / brewery.rated_hads
    }))
    .sort((a, b) => {
      if ((!a.average && !b.average) || !a.average) {
        return 1;
      }
      if (!b.average) {
        return -1;
      }

      return b.average - a.average;
    });

  return {
    beers,
    breweries,
  };
}