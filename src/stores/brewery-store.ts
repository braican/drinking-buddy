import { writable } from 'svelte/store';
import { Request } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

const bestBreweries = writable<Brewery[]>();
const popularBreweries = writable<Brewery[]>();

export default {
  refresh: async (_fetch = fetch) => {
    try {
      const stats = await Request.get<BreweryStats>('/api/breweries/stats', _fetch);
      bestBreweries.set(stats.bestBreweries);
      popularBreweries.set(stats.popularBreweries);
    } catch (error) {
      console.error('[checkinStore.refreshLatest error]', error);
    }
  },
  bestBreweries,
  popularBreweries,
};
