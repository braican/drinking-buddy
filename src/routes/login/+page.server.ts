import { fail, redirect } from '@sveltejs/kit';
import { checkPassword, setSessionCookie } from '../../lib/server/auth.ts';

/** Only same-site paths, so the login form can't be used as an open redirect. */
function safeRedirect(target: FormDataEntryValue | null): string {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : '/';
}

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const password = form.get('password');

    if (typeof password !== 'string' || !checkPassword(password)) {
      // Slow down guessing. Serverless instances don't share memory, so a real
      // lockout counter isn't practical here; a long password does the heavy lifting.
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fail(401, { error: 'Wrong password.' });
    }

    setSessionCookie(cookies);
    redirect(303, safeRedirect(form.get('redirectTo')));
  },
};
