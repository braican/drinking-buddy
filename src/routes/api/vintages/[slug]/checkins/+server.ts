import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params, url }) {
  try {
    const page = url.searchParams.get('page') || '1';
    const supabase = getSupabase();
    const family = await supabase.getVintageFamily(params.slug);

    if (!family) {
      return ApiResponse.error('Vintage family not found.', 404);
    }

    const ids = family.variants.flatMap(v => v.entries.map(e => e.id));
    const { checkins, count } = await supabase.getBeersCheckins(ids, parseInt(page));

    setHeaders({ 'cache-control': 'private, max-age=300' });
    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/vintages/<slug>/checkins]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
