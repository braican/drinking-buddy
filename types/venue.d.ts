export interface Venue {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  hads?: number;
  rated_hads?: number;
  total_rating?: number;
  average?: number;
}
