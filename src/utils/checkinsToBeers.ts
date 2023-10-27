import type { Checkin } from '@models';
export const checkinsToBeers = (checkins: Checkin[]) => {
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
