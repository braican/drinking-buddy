import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { BeerWithData, CheckinWithData } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { beer } = await req.get<{ beer: BeerWithData }>(`beer?slug=${params.slug}`);

    if (!beer) {
      throw error(404);
    }

    const { checkins } = await req.get<{ checkins: CheckinWithData[] }>(`beer/${beer.id}/checkins`);

    return {
      slug: params.slug,
      beer,
      checkins,
    };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Brewery not found.');
    }

    return {};
  }
}
