import type { BreweryBeer } from '@app';
export const beerRating = (beer: BreweryBeer) => {
  const rating = (
    beer.checkins.reduce((c, { rating }) => rating + c, 0) /
    beer.checkins.filter(ch => ch.rating).length
  ).toFixed(2);

  if (rating === 'NaN') {
    return '-';
  }

  return rating;
};
