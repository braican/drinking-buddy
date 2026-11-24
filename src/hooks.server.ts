import type { Handle } from '@sveltejs/kit/hooks';
import { isSignedIn, setSessionCookie } from './lib/server/auth.ts';

const LOGIN_PATH = '/login';

/**
 * Everything except the login page requires a session. Files in `static/` and the
 * built app assets are served before this hook runs, so the PWA manifest, icons and
 * service worker still load while signed out.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;
  const signedIn = isSignedIn(event.cookies);
  const isApi = pathname.startsWith('/api/');

  if (signedIn) {
    if (pathname === LOGIN_PATH) return redirectTo('/');
    // Slide the expiry forward on page loads so devices in regular use stay signed in.
    if (!isApi) setSessionCookie(event.cookies);
    return resolve(event);
  }

  if (pathname === LOGIN_PATH) return resolve(event);

  if (isApi) {
    return Response.json(
      { success: false, message: 'Not signed in.', status: 401 },
      { status: 401 },
    );
  }

  return redirectTo(`${LOGIN_PATH}?redirectTo=${encodeURIComponent(pathname + search)}`);
};

function redirectTo(location: string) {
  return new Response(null, { status: 303, headers: { location } });
}
