import type { BreweryBeer } from '@app';
export const beerRating = (beer: BreweryBeer) =>
  (beer.checkins.reduce((c, { rating }) => rating + c, 0) / beer.checkins.length).toFixed(2);
