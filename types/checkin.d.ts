import type { Beer } from './beer';
import type { Brewery } from './brewery';

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
  beer: Partial<Beer>;
  brewery: Partial<Brewery>;
  venue?: {
    name: string;
  };
}

export interface PaginatedCheckins {
  checkins: CheckinWithData[];
  count: number;
}
