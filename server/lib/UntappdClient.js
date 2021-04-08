import * as req from '../../util/req';
import qs from 'qs';

const API_BASE = 'https://api.untappd.com/v4';

class UntappdClient {
  setClientId(id) {
    this.clientId = id;
  }

  setClientSecret(secret) {
    this.secret = secret;
  }

  setAccessToken(token) {
    this.token = token;
  }

  getClientId() {
    return this.clientId;
  }

  async get(route, args = {}) {
    try {
      const params = {
        access_token: this.token,
        ...args,
      };

      const data = await req.get(`${API_BASE}/${route}?${qs.stringify(params)}`);
      return data.response;
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  }

  async userInfo() {
    try {
      return await this.get(`user/info`);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param {*} maxId
   * @param {int} minId The checkin to _start_ with. Defaults to 46419566, the first checkin ID.
   * @returns
   */
  async checkins(maxId = null, minId = null) {
    try {
      return await this.get(`user/checkins`, { limit: 50, max_id: maxId });
      // return await this.get(`user/checkins`, { limit: 10, min_id: 46710992 });
    } catch (e) {
      console.error(e);
    }
  }
}

export default UntappdClient;
