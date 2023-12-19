import qs from 'qs';
import { Request } from '../utils/index.js';

import type {
  UntappdResponse,
  UntappdUser,
  UntappdUserInfoResponse,
  UntappdUserCheckinsResponse,
  UntappdCheckinData,
} from '@types';

export default class UntappdClient {
  BASE = 'https://api.untappd.com/v4';
  TOKEN = null;

  setToken(token: string): void {
    this.TOKEN = token;
  }

  /**
   * Helper method to send a request with the base and token.
   */
  async req<T>(endpoint: string, args: object = {}): Promise<UntappdResponse<T>> {
    if (!this.TOKEN) {
      throw new Error('No Untappd token found.');
    }

    const params = {
      access_token: this.TOKEN,
      ...args,
    };

    const url = `${this.BASE}${endpoint}?${qs.stringify(params)}`;
    const data = await Request.getExternal<UntappdResponse<T>>(url);
    const status = (data?.meta?.code as number) || 500;

    if (status !== 200) {
      throw new Error(
        `Untappd request error: ${data?.meta?.error_detail || 'Something went wrong.'}`,
      );
    }

    return data;
  }

  async getUser(): Promise<UntappdUser> {
    const data: UntappdResponse<UntappdUserInfoResponse> = await this.req('/user/info/braican');
    return data.response.user;
  }

  async getCheckins(lastDbCheckin: number = null): Promise<UntappdCheckinData[]> {
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
        newCheckins.push(ch);
      }
    }

    return newCheckins;
  }

  async genericRequest<R>(endpoint: string, args: object = {}): Promise<UntappdResponse<R>> {
    return await this.req(endpoint, args);
  }
}
