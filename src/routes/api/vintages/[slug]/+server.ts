import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, params }) {
  try {
    const supabase = getSupabase();
    const family = await supabase.getVintageFamily(params.slug);

    if (!family) {
      return ApiResponse.error('Vintage family not found.', 404);
    }

    setHeaders({ 'cache-control': 'private, max-age=600' });
    return ApiResponse.success({ family });
  } catch (error) {
    console.error('[Error in GET api/vintages/<slug>]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
