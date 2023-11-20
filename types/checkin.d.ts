import type { Beer } from './beer';
import type { Brewery } from './brewery';
import type { Venue } from './venue';

export interface Checkin {
  id: number;
  createdAt: Date;
  comment?: string;
  rating?: number;
  beer: Beer;
  brewery: Brewery;
  venue?: Venue;
}
