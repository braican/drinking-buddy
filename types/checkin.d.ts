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
