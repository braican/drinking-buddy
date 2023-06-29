import { json } from '@sveltejs/kit';
import { TigrisClient } from '@lib';
import { Mapper } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  try {
    const tigris = await TigrisClient.create();
    const user = await tigris.getUser();

    return json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('[Error in GET api/user]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ setHeaders, request }) {
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
    console.error('[Error in POST api/user]', error);
    return json({
      success: false,
      message: error.message,
    });
  }
}
