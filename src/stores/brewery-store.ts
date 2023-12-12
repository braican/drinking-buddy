import { writable } from 'svelte/store';
import { ApiRequest } from '@utils';
import type { Brewery } from '@types';

const bestBreweries = writable<Brewery[]>();
const popularBreweries = writable<Brewery[]>();

export default {
  refresh: async () => {
    try {
      const req = new ApiRequest();

      const stats = await req.get<{
        bestBreweries: Brewery[];
        popularBreweries: Brewery[];
      }>('stats');

      bestBreweries.set(stats.bestBreweries);
      popularBreweries.set(stats.popularBreweries);
    } catch (error) {
      //
    }
  },
  bestBreweries,
  popularBreweries,
};
