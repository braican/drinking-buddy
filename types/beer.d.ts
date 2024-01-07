import type { Brewery } from './brewery';

// Beer schema for database.
export interface Beer {
  id: number;
  name: string;
  slug: string;
  label: string;
  style: string;
  abv: number;
  brewery: number;
  last_had?: Date;
  hads?: number;
  rated_hads?: number;
  total_rating?: number;
  average?: number;
}

export interface BeerWithData extends Beer {
  brewery: Brewery;
  checkins?: {
    date: Date;
    rating: number;
  }[];
}
