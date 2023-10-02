import { error } from '@sveltejs/kit';
import { Request, Api } from '@utils';
import type { Brewery } from '@models';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  try {
    const f = await fetch(`${Api.BASE_URL}/brewery?slug=${params.slug}`);
    const data = await f.json();

    return {
      streamed: {},
    };
  } catch (error) {
    return {};
  }

  // try {
  //   const brewery = await Request.get<Brewery>(`/api/brewery?slug=${params.slug}`, fetch);

  //   return {
  //     brewery,
  //     streamed: {
  //       stats: Request.get<BreweryStats>(`/api/brewery/beers?slug=${params.slug}`, fetch),
  //     },
  //   };
  // } catch (e) {
  //   if (e.status === 404) {
  //     throw error(404);
  //   }

  //   console.error('Error loading brewery data: ', e);
  //   throw error(500, 'Something went wrong.');
  // }
}
