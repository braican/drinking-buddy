const API_BASE = 'https://api.untappd.com/v4';

class UntappdClient {
  setClientId(id) {
    this.clientId = id;
  }

  setClientSecret(secret) {
    this.secret = secret;
  }
}

export default UntappdClient;
