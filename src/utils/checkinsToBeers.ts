import type { Checkin } from '@models';
import type { BeerRecord } from '@app';

export const checkinsToBeers = (checkins: Checkin[]): BeerRecord[] => {
  const beers = {};

  checkins.forEach(ch => {
    const beer = ch.beer;
    const checkinData = {
      date: ch.createdAt,
      rating: ch.rating,
    };

    if (!beers[beer.id]) {
      beers[beer.id] = {
        brewery: ch.brewery.name,
        breweryId: ch.brewery.id,
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

  return Object.values(beers);
};
