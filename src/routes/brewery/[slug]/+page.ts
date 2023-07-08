import { error } from '@sveltejs/kit';
import { Request } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  try {
    return {
      streamed: {
        brewery: Request.get<Brewery>(`/api/brewery?slug=${params.slug}`, fetch),
        stats: Request.get<BreweryStats>(`/api/brewery/beers?slug=${params.slug}`, fetch),
      },
    };
  } catch (e) {
    console.error('Error loading brewery data: ', e);
    throw error(500, 'Something went wrong.');
  }
}
