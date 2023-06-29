import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { newCheckins } = await request.json();
    const tigris = await TigrisClient.create();
    const totalAdded = await tigris.addCheckins(newCheckins);
    await tigris.updateBreweries(newCheckins);

    return json({
      success: true,
      data: { totalAdded },
    });
  } catch (error) {
    console.error('[Error in POST api/checkins/add]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}