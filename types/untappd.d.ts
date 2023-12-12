export interface UntappdResponse<T> {
  meta: {
    code?: number;
    error_detail?: string;
  };
  notifications: object;
  response: T;
}

export interface UntappdUserInfoResponse {
  user: UntappdUser;
}

export interface UntappdUserCheckinsResponse {
  checkins: {
    count: number;
    items: UntappdCheckinData[];
  };
}

export interface UntappdUser {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  user_avatar_hd: string;
  stats: {
    total_badges: number;
    total_friends: number;
    total_checkins: number;
    total_beers: number;
  };
}

export interface UntappdCheckinData {
  checkin_id: number;
  created_at: string;
  checkin_comment: string;
  rating_score: number;
  beer: {
    bid: number;
    beer_name: string;
    beer_slug: string;
    beer_label: string;
    beer_style: string;
    beer_abv: number;
  };
  brewery: {
    brewery_id: number;
    brewery_name: string;
    brewery_slug: string;
    brewery_type: string;
    brewery_label: string;
    country_name: string;
    location: {
      brewery_city: string;
      brewery_state: string;
      lat: number;
      lng: number;
    };
  };
  venue: {
    venue_id: number;
    venue_name: string;
    venue_slug: string;
    location: {
      venue_address;
      venue_city: string;
      venue_state: string;
      venue_country: string;
      lat: number;
      lng: number;
    };
  };
}
