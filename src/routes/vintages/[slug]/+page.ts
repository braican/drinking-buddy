import { error } from '@sveltejs/kit';
import { ApiRequest } from '#utils';
import type { PaginatedCheckins, VintageFamily } from '#types';

export async function load({ fetch, params }) {
  const req = new ApiRequest(fetch);
  const response = await req.get<{ family?: VintageFamily }>(`vintages/${params.slug}`);

  if (!response?.family) {
    error(404, 'Vintage family not found.');
  }

  return {
    family: response.family,
    streamed: {
      checkins: req.get<PaginatedCheckins>(`vintages/${params.slug}/checkins`),
    },
  };
}
