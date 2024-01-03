import { writable } from 'svelte/store';
import { ApiRequest } from '@utils';
import type { Brewery } from '@types';

// const bestBreweries = writable<Brewery[]>();
// const popularBreweries = writable<Brewery[]>();

const bestBreweries = writable<{
  recent: Brewery[];
  allTime: Brewery[];
}>({
  recent: [],
  allTime: [],
});

const popularBreweries = writable<{
  recent: Brewery[];
  allTime: Brewery[];
}>({
  recent: [],
  allTime: [],
});

type StatsResponse = {
  bestBreweries: Brewery[];
  popularBreweries: Brewery[];
};

export default {
  refresh: async () => {
    try {
      const req = new ApiRequest();

      const [allTime, recents] = await Promise.all([
        req.get<StatsResponse>('stats'),
        req.get<StatsResponse>('stats?timeframe=recent'),
      ]);

      bestBreweries.set({
        allTime: allTime.bestBreweries,
        recent: recents.bestBreweries,
      });

      popularBreweries.set({
        allTime: allTime.popularBreweries,
        recent: recents.popularBreweries
      });
    } catch (error) {
      //
    }
  },
  bestBreweries,
  popularBreweries,
};
