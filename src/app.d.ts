// See https://kit.svelte.dev/docs/types#app

import type { Checkin, Brewery, Beer } from '@models';

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
  status?: number;
}

export interface LatestCheckins {
  checkins: Checkin[];
}

export interface GlobalStats {
  bestBreweries: Brewery[];
  popularBreweries: Brewery[];
}

export interface BreweryBeer extends Beer {
  lastHad: Date;
  checkins: {
    date: Date;
    rating: number;
  }[];
}

export interface BreweryStats {
  beers: BreweryBeer[];
  rating: number;
  checkinCount: number;
  checkins: Checkin[];
}

export interface BrewerySearchResults {
  results: Brewery[];
}

export {};
