import { writable } from 'svelte/store';
import type { Checkin } from '@models';

const latestCheckinStore = writable<Checkin[]>();

export default {
  refreshLatest: async () => {
    const resp = await fetch('/api/checkins/latest');
    const { checkins } = await resp.json();
    latestCheckinStore.set(checkins);
  },
  latestCheckins: latestCheckinStore,
};
