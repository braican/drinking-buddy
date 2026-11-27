const APP_NAME = 'Drinking Buddy';

/**
 * Builds a document title: the given parts, most specific first, then the app name.
 * Empty parts are dropped, so `pageTitle()` is just the app name.
 */
export function pageTitle(...parts: (string | null | undefined)[]): string {
  return [...parts.filter(Boolean), APP_NAME].join(' · ');
}
