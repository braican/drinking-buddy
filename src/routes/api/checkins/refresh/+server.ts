import { json } from '@sveltejs/kit';
import { UntappdClient } from '@lib';
import { UNTAPPD_ACCESS_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { lastDbCheckin } = await request.json();
    const untappd = new UntappdClient();

    untappd.setToken(UNTAPPD_ACCESS_TOKEN);

    const newCheckins = await untappd.getCheckins(lastDbCheckin.id);

    return json({
      success: true,
      data: { newCheckins },
    });
  } catch (error) {
    console.error('[Error in POST api/checkins/refresh]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}