import SupabaseClient from '@lib/SupabaseClient';
import { ApiResponse } from '@utils';

/**
 * Resolves menu items from a photo scan against the beer history.
 *
 * Takes the `items` array straight off /api/menu/analyze, so a saved scan payload
 * can be replayed against this endpoint without re-running the image analysis.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
  try {
    const { items, menuBrewery } = await request.json();

    if (!Array.isArray(items)) {
      return ApiResponse.error('No items provided.', 400);
    }

    if (!items.length) {
      return ApiResponse.success({ matches: [] });
    }

    // A single-brewery menu often credits the brewery once in the header rather
    // than on every line, so fall back to it when an item names none.
    const resolved = items.map(item => ({
      ...item,
      brewery: item.brewery || menuBrewery || null,
    }));

    const supabase = new SupabaseClient();
    const matches = await supabase.findMenuMatches(resolved);

    return ApiResponse.success({
      matches,
      hadCount: matches.filter(match => match.beer).length,
    });
  } catch (error) {
    console.error('[Error in menu match]', error);

    return ApiResponse.error(error.message, 500);
  }
}
