// See https://kit.svelte.dev/docs/types#app

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}

export interface LatestCheckins {
  checkins: Checkin[];
}

export interface BeerRecord extends Beer {
  brewery: string;
  breweryId: number;
  lastHad: Date;
  checkins: {
    date: Date;
    rating: number;
  }[];
}

export interface BreweryRecord extends Brewery {
  beerCount?: number;
  beers?: BeerRecord[];
  checkins?: Checkin[];
}

export interface BreweryStats {
  beers: BeerRecord[];
  rating: number;
  checkinCount: number;
  checkins: Checkin[];
}

export interface BrewerySearchResults {
  results: Brewery[];
}

export {};
