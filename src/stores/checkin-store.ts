import { writable } from 'svelte/store';
import { ApiRequest } from '@utils';
import type { Checkin } from '@types';

const latestCheckinStore = writable<Checkin[]>();

export default {
  refresh: async () => {
    try {
      const req = new ApiRequest();
      const response = await req.get<{ checkins: Checkin[] }>('checkins/latest');
      latestCheckinStore.set(response.checkins);
    } catch (error) {
      //
    }
  },
  latestCheckins: latestCheckinStore,
};
