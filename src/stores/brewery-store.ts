import { writable } from 'svelte/store';
import { Request } from '@utils';
import type { Brewery } from '@models';
import type { GlobalStats } from '@app';

const bestBreweries = writable<Brewery[]>();
const popularBreweries = writable<Brewery[]>();

export default {
  refresh: async () => {
    try {
      const stats = await Request.get<GlobalStats>('/api/breweries/stats');
      bestBreweries.set(stats.bestBreweries);
      popularBreweries.set(stats.popularBreweries);
    } catch (error) {
      console.error('[breweryStore.refresh error]', error);
    }
  },
  bestBreweries,
  popularBreweries,
};
