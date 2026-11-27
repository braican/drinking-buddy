import { defineEnvVars } from '@sveltejs/kit/env';

// All of these are read at runtime from the Worker's environment (Cloudflare secrets in
// production, `.env` in dev).
//
// They're declared optional because SvelteKit also validates them while building (the
// "Analysing routes" step), and Cloudflare's build environment doesn't have the runtime
// secrets. Values aren't inlined, so nothing is lost at build time; each one is checked
// where it's used instead (see `src/lib/server/auth.ts` and `SupabaseClient`).
const runtimeSecret = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
  SUPABASE_URL: { schema: runtimeSecret },
  SUPABASE_SERVICE_KEY: { schema: runtimeSecret },
  ANTHROPIC_API_KEY: { schema: runtimeSecret },
  UNTAPPD_ACCESS_TOKEN: { schema: runtimeSecret },
  APP_PASSWORD: {
    description: 'Password for signing in to the app. Changing it signs out every device.',
    schema: runtimeSecret,
  },
});
