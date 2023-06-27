import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';

export async function GET({ setHeaders }) {
  setHeaders({
    'cache-control': 'max-age=60',
  });

  try {
    const tigris = await TigrisClient.create();
    const user = await tigris.getUser();

    return json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[Error in api/user/+server.ts]', error);
    return json({
      success: false,
      error,
    });
  }
}
