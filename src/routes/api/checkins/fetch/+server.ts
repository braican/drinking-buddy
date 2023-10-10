import { UntappdClient } from '@lib';
import { ApiResponse } from '@utils';
import { UNTAPPD_ACCESS_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { lastDbCheckin } = await request.json();
    const untappd = new UntappdClient();

    untappd.setToken(UNTAPPD_ACCESS_TOKEN);

    const newCheckins = await untappd.getCheckins(lastDbCheckin.id);
    return ApiResponse.success({ newCheckins });
  } catch (error) {
    console.error('[Error in POST api/checkins/fetch]', error);
    return ApiResponse.error(error.message);
  }
}
