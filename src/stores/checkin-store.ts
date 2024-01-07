import { writable } from 'svelte/store';
import { ApiRequest } from '@utils';
import type { CheckinWithData } from '@types';

const latestCheckinStore = writable<CheckinWithData[]>();

export default {
  refresh: async () => {
    try {
      const req = new ApiRequest();
      const response = await req.get<{ checkins: CheckinWithData[] }>('checkins/latest');
      latestCheckinStore.set(response.checkins);
    } catch (error) {
      //
    }
  },
  latestCheckins: latestCheckinStore,
};
