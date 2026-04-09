import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
  // Ignore generated/build dirs
  {
    ignores: ['.svelte-kit/', 'build/', 'node_modules/'],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript
  {
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
    rules: tsPlugin.configs.recommended.rules,
  },

  // Svelte
  ...sveltePlugin.configs['flat/recommended'],

  // Prettier compat (disables rules that conflict with prettier formatting)
  prettierConfig,

  // Global env + project-level rules
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-constant-condition': ['error', { checkLoops: false }],
    },
  },

  // TypeScript parser inside Svelte <script> blocks
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
