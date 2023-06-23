import dotenv from 'dotenv';
import 'isomorphic-fetch';

dotenv.config();

export default class UntappdClient {
  static BASE = 'https://api.untappd.com/v4';

  getUser() {
    return new Promise((resolve, reject) => {
      fetch(`${UntappdClient.BASE}/user/info/braican?access_token=${process.env.UNTAPPD_CODE}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error. Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
}
