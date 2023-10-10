import { UntappdClient, TigrisClient } from '@lib';
import { ApiResponse } from '@utils';
import { UNTAPPD_ACCESS_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    const tigris = await TigrisClient.create();
    const untappd = new UntappdClient();

    untappd.setToken(UNTAPPD_ACCESS_TOKEN);

    const [user, lastDbCheckin, dbCheckinCount] = await Promise.all([
      untappd.getUser(),
      tigris.getLastCheckin(),
      tigris.getCheckinCount(),
    ]);

    return ApiResponse.success({
      untappdUser: user,
      dbCheckins: dbCheckinCount,
      lastDbCheckin,
    });
  } catch (error) {
    console.error('[Error in GET api/checkins/pre-fetch]', error);
    return ApiResponse.error(error.message);
  }
}
