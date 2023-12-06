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
  beer: {
    name: string;
    slug: string;
    style: string;
  };
  brewery: {
    name: string;
  };
  venue?: {
    name: string;
  };
}
