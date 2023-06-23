import dotenv from 'dotenv';
import qs from 'qs';
import 'isomorphic-fetch';
import Request from './Request.ts';
import { Mapper } from '../util/index.ts';
import type { Checkin } from '../db/models/index.ts';

dotenv.config();

interface UntappdResponse<T> {
  meta: object;
  notifications: object;
  response: T;
}

interface UntappdUserInfoResponse {
  user: UntappdUserData;
}
interface UntappdUserCheckinsResponse {
  checkins: {
    count: number;
    items: UntappdCheckinData[];
  };
}

interface UntappdUserData {
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
    beer_label: string;
    beer_style: string;
    beer_abv: number;
  };
  brewery: {
    brewery_id: number;
    brewery_name: string;
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

export default class UntappdClient {
  BASE = 'https://api.untappd.com/v4';
  TOKEN = process.env.UNTAPPD_ACCESS_TOKEN;

  /**
   * Helper method to send a request with the base and token.
   */
  async req<T>(endpoint: string, args: object = {}): Promise<T> {
    const params = {
      access_token: this.TOKEN,
      ...args,
    };

    const url = `${this.BASE}${endpoint}?${qs.stringify(params)}`;
    return await Request.get(url);
  }

  async getUser(): Promise<UntappdUserData> {
    const data: UntappdResponse<UntappdUserInfoResponse> = await this.req('/user/info/braican');
    return data.response.user;
  }

  async getCheckins(lastDbCheckin: number = null): Promise<Checkin[]> {
    const newCheckins = [];
    let checkinPointer = null;

    requestLoop: while (true) {
      const params = {
        limit: 50,
        max_id: checkinPointer,
      };

      const data: UntappdResponse<UntappdUserCheckinsResponse> = await this.req(
        '/user/checkins/braican',
        params,
      );

      const checkins = data?.response?.checkins?.items;

      if (!checkins) {
        break requestLoop;
      }

      for (let i = 0; i < checkins.length; i++) {
        const ch = checkins[i];

        if (ch.checkin_id <= lastDbCheckin) {
          break requestLoop;
        }

        checkinPointer = ch.checkin_id;
        newCheckins.push(Mapper.checkin(ch));
      }
    }

    return newCheckins;
  }
}
