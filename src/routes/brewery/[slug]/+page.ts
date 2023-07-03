import { error } from '@sveltejs/kit';
import { Request } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  const { brewery } = await Request.get<{ brewery: Brewery }>(
    `/api/brewery?slug=${params.slug}`,
    fetch,
  );

  try {
    return {
      brewery,
      streamed: {
        stats: Request.get<BreweryStats>(`/api/brewery/beers?slug=${params.slug}`, fetch),
      },
    };
  } catch (e) {
    console.error('Error loading brewery data: ', e);
    throw error(500, 'Something went wrong.');
  }
}
