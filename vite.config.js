import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
    }),
  ],
  environments: {
    ssr: {
      optimizeDeps: {
        // The Cloudflare adapter prebundles Svelte for SSR in dev, but SvelteKit's renderer
        // imports `svelte/server`, which isn't in that bundle. It then loads a second copy of
        // Svelte's server runtime, and the dev-only `instanceof Renderer` check on snippets
        // fails on every page (`invalid_snippet_arguments`). Bundle it with the rest.
        include: ['svelte/server'],
      },
    },
  },
});
