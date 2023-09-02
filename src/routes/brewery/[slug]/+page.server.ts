import { error } from '@sveltejs/kit';
import { Request } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  try {
    const brewery = await Request.get<Brewery>(`/api/brewery?slug=${params.slug}`, fetch);

    if (!brewery) {
      console.log('no brewery');
    }
    return {
      brewery,
      streamed: {
        stats: Request.get<BreweryStats>(`/api/brewery/beers?slug=${params.slug}`, fetch),
      },
    };
  } catch (e) {
    if (e.status === 404) {
      throw error(404);
    }

    console.error('Error loading brewery data: ', e);
    throw error(500, 'Something went wrong.');
  }
}
