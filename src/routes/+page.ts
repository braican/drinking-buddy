import { ApiRequest } from '@utils';
import type { CheckinWithData, Brewery } from '@types';

type StatsResponse = { bestBreweries: Brewery[]; popularBreweries: Brewery[] };

export async function load({ fetch }) {
  const req = new ApiRequest(fetch);

  const [checkinsData, allTimeStats] = await Promise.all([
    req.get<{ checkins: CheckinWithData[] }>('checkins/latest'),
    req.get<StatsResponse>('stats'),
  ]);

  return {
    latestCheckins: checkinsData?.checkins ?? [],
    bestBreweries: {
      allTime: allTimeStats?.bestBreweries ?? [],
      recent: [] as Brewery[],
    },
    popularBreweries: {
      allTime: allTimeStats?.popularBreweries ?? [],
      recent: [] as Brewery[],
    },
    streamed: {
      recentStats: req.get<StatsResponse>('stats?timeframe=recent'),
    },
  };
}
