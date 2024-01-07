import type { Beer } from './beer';
import type { Brewery } from './brewery';
import type { Venue } from './venue';

// Checkin schema for database.
export interface Checkin {
  id: number;
  created_at: Date;
  comment?: string;
  rating?: number;
  beer: number;
  brewery: number;
  venue?: number;
}

// Type for the return of a checkin query.
export interface CheckinWithData extends Checkin {
  beer: Beer;
  brewery: Brewery;
  venue?: Venue;
}

export interface PaginatedCheckins {
  checkins: CheckinWithData[];
  count: number;
}
