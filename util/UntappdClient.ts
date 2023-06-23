import dotenv from 'dotenv';
import qs from 'qs';
import 'isomorphic-fetch';
import Request from './Request';

dotenv.config();

interface UntappdResponse<T> {
  meta: object;
  notifications: object;
  response: T;
}

interface UntappdUserInfoResponse {
  user: UntappdUserData;
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

export default class UntappdClient {
  BASE = 'https://api.untappd.com/v4';
  TOKEN = process.env.UNTAPPD_ACCESS_TOKEN;

  async getUser(): Promise<UntappdUserData> {
    const params = {
      access_token: this.TOKEN,
    };
    const data: UntappdResponse<UntappdUserInfoResponse> = await Request.get(
      `${this.BASE}/user/info/braican?${qs.stringify(params)}`,
    );
    return data.response.user;
  }
}
