import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const response = await req.get<{ brewery: Brewery }>(`brewery?slug=${params.slug}`);

    if (response === null) {
      throw error(404);
    }

    return {
      brewery: response.brewery,
      streamed: {
        stats: req.get<BreweryStats>(`brewery/beers?slug=${params.slug}`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Brewery not found.');
    }

    return {};
  }
}
