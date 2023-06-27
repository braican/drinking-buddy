import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

export async function GET({ setHeaders }) {
  try {
    const tigris = await TigrisClient.create();
    const checkins = await tigris.getLatestCheckins();

    return json({
      success: true,
      checkins,
    });
  } catch (error) {
    console.error('[Error in api/checkins/latest/+server.ts]', error);
    throw new Error(error);
  }
}
