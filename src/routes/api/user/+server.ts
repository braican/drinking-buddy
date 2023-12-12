import { SupabaseClient } from '@lib';
import { ApiResponse, Mapper } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  try {
    const supabase = new SupabaseClient();
    const user = await supabase.getUser();
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
    const supabase = new SupabaseClient();
    const newDbUser = Mapper.user(untappdUser);
    await supabase.addUser(newDbUser);
    return ApiResponse.success({ user: newDbUser });
  } catch (error) {
    console.error('[Error in POST api/user]', error);
    return ApiResponse.error(error.message);
  }
}
