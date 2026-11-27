import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  try {
    const supabase = getSupabase();
    const families = await supabase.getVintageFamilies();

    setHeaders({ 'cache-control': 'private, max-age=600' });
    return ApiResponse.success({ families });
  } catch (error) {
    console.error('[Error in GET api/vintages]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
