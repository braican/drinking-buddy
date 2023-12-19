import { SupabaseClient } from '@lib';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders, url }) {
  try {
    const style = url.searchParams.get('style');
    const state = url.searchParams.get('state');
    const page = url.searchParams.get('page') || '1';

    console.log(style, state, page);

    const supabase = new SupabaseClient();
    const { checkins, count } = await supabase.getFilteredCheckins(
      { style, state },
      parseInt(page),
    );

    return ApiResponse.success({ checkins, count });
  } catch (error) {
    console.error('[Error in GET api/filter]', error);
    return ApiResponse.error(error.message, error.status);
  }
}
