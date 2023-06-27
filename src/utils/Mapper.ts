import type { Checkin, User } from '../../db/models/index.ts';
import type { UntappdCheckinData, UntappdUserData } from '../lib/UntappdClient.ts';

export default class Mapper {
  static checkin(ch: UntappdCheckinData): Checkin {
    return {
      id: ch.checkin_id,
      createdAt: new Date(ch.created_at),
      comment: ch.checkin_comment,
      rating: ch.rating_score,
      beer: {
        id: ch.beer.bid,
        name: ch.beer.beer_name,
        label: ch.beer.beer_label,
        style: ch.beer.beer_style,
        abv: ch.beer.beer_abv,
      },
      brewery: {
        id: ch.brewery.brewery_id,
        name: ch.brewery.brewery_name,
        type: ch.brewery.brewery_type,
        label: ch.brewery.brewery_label,
        city: ch.brewery.location.brewery_city,
        state: ch.brewery.location.brewery_state,
        country: ch.brewery.country_name,
        lat: ch.brewery.location.lat,
        lng: ch.brewery.location.lng,
      },
      venue: Array.isArray(ch.venue)
        ? null
        : {
            id: ch.venue.venue_id,
            name: ch.venue.venue_name,
            address: ch.venue.location.venue_address,
            city: ch.venue.location.venue_city,
            state: ch.venue.location.venue_state,
            country: ch.venue.location.venue_country,
            lat: ch.venue.location.lat,
            lng: ch.venue.location.lng,
          },
      raw: JSON.stringify(ch),
    };
  }

  static user(user: UntappdUserData): User {
    return {
      id: user.id,
      username: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.user_avatar_hd,
      badges: user.stats.total_badges,
      checkins: user.stats.total_checkins,
      beers: user.stats.total_beers,
    };
  }
}
