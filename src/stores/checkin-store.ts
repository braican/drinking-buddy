import { writable } from 'svelte/store';
import { Request } from '@utils';
import type { Checkin } from '@models';
import type { LatestCheckins } from '@app';

const latestCheckinStore = writable<Checkin[]>();

export default {
  refreshLatest: async (_fetch = fetch) => {
    try {
      const { checkins } = await Request.get<LatestCheckins>('/api/checkins/latest', _fetch);
      latestCheckinStore.set(checkins);
    } catch (error) {
      console.error('[checkinStore.refreshLatest error]', error);
    }
  },
  latestCheckins: latestCheckinStore,
};