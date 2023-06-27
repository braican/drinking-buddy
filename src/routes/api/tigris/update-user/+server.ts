import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';
import { Mapper } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { untappdUser } = await request.json();
    const tigris = await TigrisClient.create();
    const newDbUser = Mapper.user(untappdUser);

    newDbUser.lastUpdated = new Date();

    await tigris.addUser(newDbUser);

    return json({
      success: true,
      data: {
        user: newDbUser,
      },
    });
  } catch (error) {
    console.error('[Error in api/untappd/refresh/+server.ts]', error);
    throw new Error(error.message);
  }
}
