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

  /**
   * Utility for getting an endpoint from the Untappd API.
   *
   * @param {string} route URL to get.
   * @param {object} args Paramters to send with the request.
   *
   * @returns object
   */
  async get(route, args = {}) {
    try {
      const params = {
        access_token: this.token,
        ...args,
      };

      const data = await req.get(`${API_BASE}/${route}?${qs.stringify(params)}`);
      return data.response;
    } catch (e) {
      // Handle API limit error.
      if (JSON.parse(e).meta.code === 429) {
        console.error('[ERROR] in UntappdClient.get()');
        console.error(
          '[ERROR] The authenticated user has reached their API limit for the hour. Please wait before making another call.',
        );
        return false;
      }

      console.error('[ERROR] in UntappdClient.get()');
      console.error(e);

      throw new Error(e);
    }
  }

  /**
   * Get user info.
   *
   * @returns object
   */
  async userInfo() {
    try {
      return await this.get(`user/info`);
    } catch (e) {
      return false;
    }
  }

  /**
   * Get checkins, in chronological order.
   *
   * @param {int} maxId Checkin to start with. This grabs checkins that occurred
   *                    _before_ this one. We can't really use the `min_id`
   *                    parameter since the Untappd API will only allow you to use a
   *                    `min_id` value that is less than 10 days from today.
   *
   * @returns object
   */
  async checkins(maxId = null) {
    try {
      const data = await this.get(`user/checkins`, { limit: 50, max_id: maxId });

      if (data === false) {
        return { checkins: [], pagination: {}, error: 'Error' };
      }

      return data;
    } catch (e) {
      return false;
    }
  }
}

export default UntappdClient;
