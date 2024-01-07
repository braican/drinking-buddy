import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Brewery, Beer, PaginatedCheckins } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { brewery } = await req.get<{ brewery: Brewery }>(`brewery?slug=${params.slug}`);

    if (!brewery) {
      throw error(404);
    }

    const { beers } = await req.get<{ beers: Beer[] }>(`brewery/${brewery.id}/beers`);

    return {
      brewery,
      beers,
      streamed: {
        checkins: req.get<PaginatedCheckins>(`brewery/${brewery.id}/checkins`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Brewery not found.');
    }

    return {};
  }
}
