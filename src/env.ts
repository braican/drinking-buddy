import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  UNTAPPD_ACCESS_TOKEN: { static: true },
  APP_PASSWORD: {
    description: 'Password for signing in to the app. Changing it signs out every device.',
    // Fail at startup rather than run the app unprotected.
    schema: value => {
      if (!value) throw new Error('APP_PASSWORD must be set.');
      return value;
    },
  },
});
