import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),

    alias: {
      '@types': './types',
      '@components': './src/components/index.js',
      '@icons': './src/icons/index.js',
      '@utils': './src/utils/index.js',
      '@utils/*': './src/utils/*',
      '@lib': './src/lib/index.js',
      '@lib/*': './src/lib/*',
      '@stores': './src/stores/index.js',
    },
  },
};

export default config;
