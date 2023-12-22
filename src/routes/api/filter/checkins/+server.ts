import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const year = url.searchParams.get('year');
    const page = url.searchParams.get('page') || '1';

    const supabase = new SupabaseClient();
    const { checkins, count } = await supabase.getFilteredCheckins(
      { style, state, year },
      parseInt(page),
    );

    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
