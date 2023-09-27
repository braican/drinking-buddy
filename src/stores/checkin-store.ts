import { writable } from 'svelte/store';
import { Request } from '@utils';
import type { Checkin } from '@models';
import type { LatestCheckins } from '@app';

const latestCheckinStore = writable<Checkin[]>();

export default {
  refresh: async () => {
    try {
      const { checkins } = await Request.get<LatestCheckins>('/api/checkins/latest');
      latestCheckinStore.set(checkins);
    } catch (error) {
      console.error('[checkinStore.refreshLatest error]', error);
    }
  },
  latestCheckins: latestCheckinStore,
};
