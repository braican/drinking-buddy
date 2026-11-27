import { getSupabase } from '#lib/server/supabase.ts';
import { UntappdClient } from '#lib';
import { ApiResponse } from '#utils';
import { UNTAPPD_ACCESS_TOKEN } from '$app/env/private';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    const supabase = getSupabase();
    const untappd = new UntappdClient();

    untappd.setToken(UNTAPPD_ACCESS_TOKEN);

    const [user, lastDbCheckin, dbCheckinCount] = await Promise.all([
      untappd.getUser(),
      supabase.getLastCheckin(),
      supabase.getCheckinCount(),
    ]);

    return ApiResponse.success({
      untappdUser: user,
      lastDbCheckin,
      dbCheckinCount,
    });
  } catch (error) {
    console.error('[Error in GET api/checkins/pre-fetch]', error);
    return ApiResponse.error(error.message);
  }
}
