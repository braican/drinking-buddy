import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({ UNTAPPD_ACCESS_TOKEN: { static: true } });
