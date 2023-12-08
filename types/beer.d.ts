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
  total_rating?: number;
  average?: number;
}

export interface BeerWithData extends Beer {
  brewery: Partial<Brewery>;
  checkins?: {
    date: Date;
    rating: number;
  }[];
}
