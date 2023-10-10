import { writable } from 'svelte/store';
import { ApiRequest } from '@utils';
import type { Brewery } from '@models';

const bestBreweries = writable<Brewery[]>();
const popularBreweries = writable<Brewery[]>();

export default {
  refresh: async () => {
    try {
      const req = new ApiRequest();

      const [best, popular] = await Promise.all([
        req.get<{ breweries: Brewery[] }>('breweries/best'),
        req.get<{ breweries: Brewery[] }>('breweries/popular'),
      ]);

      bestBreweries.set(best.breweries);
      popularBreweries.set(popular.breweries);
    } catch (error) {
      //
    }
  },
  bestBreweries,
  popularBreweries,
};
