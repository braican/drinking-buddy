// Single-user auth: one password (APP_PASSWORD) and a long-lived session cookie.
//
// The cookie holds an HMAC derived from the password, so there's no session store.
// Changing APP_PASSWORD invalidates every existing cookie, which signs out all devices.

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { APP_PASSWORD } from '$app/env/private';

const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // one year, refreshed on each visit

function hmac(value: string): Buffer {
  // Fail closed: with no password, every request errors rather than the app running open.
  if (!APP_PASSWORD) throw new Error('APP_PASSWORD must be set.');
  return createHmac('sha256', APP_PASSWORD).update(value).digest();
}

const sessionToken = () => hmac('session:v1').toString('base64url');

export function checkPassword(input: string): boolean {
  // Compare fixed-length digests so the check takes the same time for any input.
  return timingSafeEqual(hmac(`password:${input}`), hmac(`password:${APP_PASSWORD}`));
}

export function isSignedIn(cookies: Cookies): boolean {
  const token = cookies.get(SESSION_COOKIE);
  if (!token) return false;

  const given = Buffer.from(token);
  const expected = Buffer.from(sessionToken());
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function setSessionCookie(cookies: Cookies) {
  // httpOnly and secure are on by default (secure is off in dev).
  cookies.set(SESSION_COOKIE, sessionToken(), {
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
  });
}
