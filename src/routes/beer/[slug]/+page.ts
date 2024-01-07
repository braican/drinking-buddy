import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { BeerWithData, PaginatedCheckins } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { beer } = await req.get<{ beer: BeerWithData }>(`beer?slug=${params.slug}`);

    if (!beer) {
      throw error(404);
    }

    return {
      slug: params.slug,
      beer,
      streamed: {
        checkins: req.get<PaginatedCheckins>(`beer/${beer.id}/checkins`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Beer not found.');
    }

    return {};
  }
}
