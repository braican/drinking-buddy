import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Brewery, Beer, PaginatedCheckins } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { brewery, beers } = await req.get<{ brewery: Brewery; beers: Beer[] }>(
      `brewery?slug=${params.slug}`,
    );

    if (!brewery) {
      error(404);
    }

    return {
      brewery,
      beers,
      streamed: {
        checkins: req.get<PaginatedCheckins>(`brewery/${brewery.id}/checkins`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      error(404, 'Brewery not found.');
    }

    return {};
  }
}
