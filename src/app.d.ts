// See https://kit.svelte.dev/docs/types#app

import type { UntappdUserData } from '@lib/UntappdClient';
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
  data: T;
}

export interface UntappdPrefetchResponse {
  untappdUser: UntappdUserData;
  dbCheckins: number;
  lastDbCheckin: number;
}

export interface UntappdRefreshResponse {
  newCheckins: Checkin[];
}

export interface TigrisAddCheckinsResponse {
  totalAdded: number;
}

export {};
