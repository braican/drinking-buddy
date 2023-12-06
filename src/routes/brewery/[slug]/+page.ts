import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Brewery, Beer, CheckinWithData } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { brewery } = await req.get<{ brewery: Brewery }>(`brewery?slug=${params.slug}`);

    if (!brewery) {
      throw error(404);
    }

    const { beers } = await req.get<{ beers: Beer[] }>(`brewery/${brewery.id}/beers`);
    const { checkins } = await req.get<{ checkins: CheckinWithData[] }>(
      `brewery/${brewery.id}/checkins`,
    );

    return { brewery, beers, checkins };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Brewery not found.');
    }

    return {};
  }
}
