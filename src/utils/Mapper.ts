import type { UntappdCheckinData, UntappdUser, Checkin, Beer, Brewery, Venue, User } from '@types';

/**
 * Map data from the Untappd API to the database schema.
 */
export default class Mapper {
  static checkin(ch: UntappdCheckinData): Checkin {
    return {
      id: ch.checkin_id,
      created_at: new Date(ch.created_at),
      comment: ch.checkin_comment,
      rating: ch.rating_score,
      beer: ch.beer.bid,
      brewery: ch.brewery.brewery_id,
      venue: Array.isArray(ch.venue) ? null : ch.venue.venue_id,
    };
  }

  static beer(ch: UntappdCheckinData): Beer {
    return {
      id: ch.beer.bid,
      name: ch.beer.beer_name,
      slug: ch.beer.beer_slug,
      label: ch.beer.beer_label,
      style: ch.beer.beer_style,
      abv: ch.beer.beer_abv,
      brewery: ch.brewery.brewery_id,
    };
  }

  static brewery(ch: UntappdCheckinData): Brewery {
    return {
      id: ch.brewery.brewery_id,
      name: ch.brewery.brewery_name,
      slug: ch.brewery.brewery_slug,
      type: ch.brewery.brewery_type,
      label: ch.brewery.brewery_label,
      city: ch.brewery.location.brewery_city,
      state: ch.brewery.location.brewery_state,
      country: ch.brewery.country_name,
      lat: ch.brewery.location.lat,
      lng: ch.brewery.location.lng,
    };
  }

  static venue(ch: UntappdCheckinData): Venue | null {
    if (Array.isArray(ch.venue)) return null;
    return {
      id: ch.venue.venue_id,
      name: ch.venue.venue_name,
      slug: ch.venue.venue_slug,
      address: ch.venue.location.venue_address,
      city: ch.venue.location.venue_city,
      state: ch.venue.location.venue_state,
      country: ch.venue.location.venue_country,
      lat: ch.venue.location.lat,
      lng: ch.venue.location.lng,
    };
  }

  static user(user: UntappdUser): User {
    return {
      id: user.id,
      username: user.user_name,
      firstname: user.first_name,
      lastname: user.last_name,
      avatar: user.user_avatar_hd,
      badges: user.stats.total_badges,
      checkins: user.stats.total_checkins,
      beers: user.stats.total_beers,
    };
  }
}
