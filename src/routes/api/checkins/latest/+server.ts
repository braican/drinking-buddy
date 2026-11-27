import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const supabase = getSupabase();
    const { checkins } = await supabase.getCheckins();
    setHeaders({ 'cache-control': 'private, max-age=300' });
    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/checkins/latest]', error);
    return ApiResponse.error(error.message);
  }
}
