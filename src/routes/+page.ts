import { checkinStore } from '@stores';
import { Request } from '@utils';
import type { LatestCheckins } from '../app.js';

export async function load({ fetch }) {
  try {
    const { checkins } = await Request.get<LatestCheckins>('/api/checkins/latest', fetch);
    checkinStore.latestCheckins.set(checkins);
    return {};
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
