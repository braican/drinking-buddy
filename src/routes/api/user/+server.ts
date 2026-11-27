import { getSupabase } from '#lib/server/supabase.ts';
import { ApiResponse, Mapper } from '#utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  try {
    const supabase = getSupabase();
    const user = await supabase.getUser();
    setHeaders({ 'cache-control': 'private, max-age=300' });
    return ApiResponse.success({ user });
  } catch (error) {
    console.error('[Error in GET api/user]', error);
    return ApiResponse.error(error.message);
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { untappdUser } = await request.json();
    const supabase = getSupabase();
    const newDbUser = Mapper.user(untappdUser);
    await supabase.addUser(newDbUser);
    return ApiResponse.success({ user: newDbUser });
  } catch (error) {
    console.error('[Error in POST api/user]', error);
    return ApiResponse.error(error.message);
  }
}
