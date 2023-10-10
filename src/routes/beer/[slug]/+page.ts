import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Beer, Brewery, Checkin } from '@models';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);

    return {
      slug: params.slug,
      streamed: {
        beerData: req.get<{ beer: Beer; brewery: Brewery }>(`beer?slug=${params.slug}`),
        checkinData: req.get<{ checkins: Checkin[] }>(`beer/checkins?slug=${params.slug}`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      throw error(404, 'Brewery not found.');
    }

    return {};
  }
}
