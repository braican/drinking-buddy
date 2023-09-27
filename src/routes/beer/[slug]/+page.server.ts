import { error } from '@sveltejs/kit';
import { Request } from '@utils';
import type { Beer, Brewery, Checkin } from '@models';

export async function load({ fetch, params }) {
  try {
    return {
      slug: params.slug,
      streamed: {
        beerData: Request.get<{ beer: Beer; brewery: Brewery }>(
          `/api/beer?slug=${params.slug}`,
          fetch,
        ),
        checkinData: Request.get<Checkin[]>(`/api/beer/checkins?slug=${params.slug}`, fetch),
      },
    };
  } catch (e) {
    if (e.status === 404) {
      throw error(404);
    }

    console.error('Error loading beer data: ', e);
    throw error(500, 'Something went wrong.');
  }
}
