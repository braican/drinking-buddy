import * as req from '../../util/req';

const API_BASE = 'https://api.untappd.com/v4';

class UntappdClient {
  setClientId(id) {
    this.clientId = id;
  }

  setClientSecret(secret) {
    this.secret = secret;
  }

  getClientId() {
    return this.clientId;
  }

  async get(route) {
    try {
      return await req.get(
        `${API_BASE}/${route}?client_id=${this.clientId}&client_secret=${this.secret}`,
      );
    } catch (e) {
      console.error(e);
    }
  }

  async userInfo() {
    try {
      return await this.get(`user/info/braican`);
    } catch (e) {
      console.error(e);
    }
  }
}

export default UntappdClient;
