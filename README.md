# Drinking Buddy

An Untappd companion app to help identify deeper stats around beer data. This app is built with Svelte and Sveltekit; data is stored in [Supabase](https://supabase.com/); data is sourced from the [Untappd API](https://untappd.com/api/docs).

## Installation

1. Create an `.env` file with `cp .env.sample .env`, then add the relevant values.
2. Run `nvm install`.
3. Run `npm install`.

## Development

1. Run `nvm install`.
2. Run `npm run dev` to start the development server.

## Architecture

This app runs on [Cloudflare Workers](https://developers.cloudflare.com/workers/) (via `@sveltejs/adapter-cloudflare`), with data stored in Supabase. Worker config lives in `wrangler.jsonc`.

### Deploying

Pushes to `main` deploy through Workers Builds. To deploy by hand, run `npm run deploy`.

Secrets are set on the Worker, not in `wrangler.jsonc`. For each of `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `UNTAPPD_ACCESS_TOKEN` and `APP_PASSWORD`, run:

```sh
npx wrangler secret put <NAME>
```

Locally, `npm run dev` runs in the Workers runtime and reads secrets from `.env`.

## Credits

- Icons by HeroIcons v1 Solid (https://icones.js.org/collection/heroicons-solid)
