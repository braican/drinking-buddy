import { error } from '@sveltejs/kit';
import { ApiRequest } from '@utils';
import type { PaginatedCheckins, Venue } from '@types';

export async function load({ fetch, params }) {
  try {
    const req = new ApiRequest(fetch);
    const { venue } = await req.get<{ venue: Venue }>(`venue?slug=${params.slug}`);

    if (!venue) {
      error(404);
    }

    return {
      slug: params.slug,
      venue,
      streamed: {
        checkins: req.get<PaginatedCheckins>(`venue/${venue.id}/checkins`),
      },
    };
  } catch (err) {
    if (err.status === 404) {
      error(404, 'Brewery not found.');
    }

    return {};
  }
}
