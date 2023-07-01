import { error } from '@sveltejs/kit';
import { Request } from '@utils';
import type { BreweryStats } from '@app';

export async function load({ fetch, params }) {
  try {
    return await Request.get<BreweryStats>(`/api/brewery?slug=${params.slug}`, fetch);
  } catch (e) {
    console.error('Error loading brewery data: ', e);
    throw error(500, 'Something went wrong.');
  }
}
