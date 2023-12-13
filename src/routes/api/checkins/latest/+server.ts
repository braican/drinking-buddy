import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }): Promise<Response> {
  try {
    const supabase = new SupabaseClient();
    const { checkins } = await supabase.getCheckins();
    return ApiResponse.success({ checkins });
  } catch (error) {
    console.error('[Error in GET api/checkins/latest]', error);
    return ApiResponse.error(error.message);
  }
}
