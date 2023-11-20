export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  badges: number;
  checkins: number;
  beers: number;
  last_updated?: Date;
}
