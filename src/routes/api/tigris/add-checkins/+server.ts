import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { newCheckins } = await request.json();
    const tigris = await TigrisClient.create();
    const totalAdded = await tigris.addCheckins(newCheckins);

    return json({
      success: true,
      data: { totalAdded },
    });
  } catch (error) {
    console.error('[Error in api/untappd/refresh/+server.ts]', error);
    throw new Error(error.message);
  }
}
