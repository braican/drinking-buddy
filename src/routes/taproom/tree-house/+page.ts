import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { Brewery, Beer } from '@types';

const BREWERY_SLUG = 'tree-house-brewing-company';

export async function load({ fetch }) {
  try {
    const req = new ApiRequest(fetch);
    const { brewery } = await req.get<{ brewery: Brewery }>(`brewery?slug=${BREWERY_SLUG}`);

    if (!brewery) {
      error(404, 'Brewery not found.');
    }

    const { beers } = await req.get<{ beers: Beer[] }>(`brewery/${brewery.id}/beers`);

    return { brewery, beers };
  } catch (err) {
    if (err.status === 404) {
      error(404, 'Brewery not found.');
    }

    return {};
  }
}
