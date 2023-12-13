import type { BeerWithData } from './beer';

// Checkin schema for database.
export interface Brewery {
  id: number;
  name: string;
  slug: string;
  type: string;
  label: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  hads?: number;
  rated_hads?: number;
  total_rating?: number;
  average?: number;
  beers?: BeerWithData[];
}
