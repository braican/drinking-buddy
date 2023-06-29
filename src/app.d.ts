// See https://kit.svelte.dev/docs/types#app

import type { Checkin } from '@models';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LatestCheckins {
  checkins: Checkin[];
}

export {};
