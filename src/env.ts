import { defineEnvVars } from '@sveltejs/kit/env';

// All of these are read at runtime from the Worker's environment (Cloudflare secrets in
// production, `.env` in dev). Variables without a schema are required: the app fails at
// startup if one is missing.
export const variables = defineEnvVars({
  SUPABASE_URL: {},
  SUPABASE_SERVICE_KEY: {},
  ANTHROPIC_API_KEY: {},
  UNTAPPD_ACCESS_TOKEN: {},
  APP_PASSWORD: {
    description: 'Password for signing in to the app. Changing it signs out every device.',
    // Fail at startup rather than run the app unprotected.
    schema: value => {
      if (!value) throw new Error('APP_PASSWORD must be set.');
      return value;
    },
  },
});
