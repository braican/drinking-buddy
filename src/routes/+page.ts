import { checkinStore } from '@stores';
import { Request } from '@utils';
import type { LatestCheckins } from '@app';

export async function load({ fetch }) {
  try {
    const [{ checkins }, { breweries: bestBreweries }] = await Promise.all([
      Request.get<LatestCheckins>('/api/checkins/latest', fetch),
      Request.get('/api/breweries/stats', fetch),
    ]);
    checkinStore.latestCheckins.set(checkins);
    return {};
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
