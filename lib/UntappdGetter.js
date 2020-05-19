const https = require('https');
const queryString = require('querystring');
const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://api.untappd.com/v4/';

class UntappdGetter {
  constructor(token, config = {}) {
    if (!token) {
      throw new Error('You must supply an authentication token.');
    }

    const defaults = {};
    this.options = { ...defaults, ...config };
    this.token = token;
  }

  get(endpoint, params = {}) {
    params = { ...params, access_token: this.token };

    const url = `${API_BASE}${endpoint}?${queryString.stringify(params)}`;

    return new Promise((resolve, reject) => {
      https
        .get(url, res => {
          // console.log('statusCode:', res.statusCode);
          console.log('\nremaining requests:', res.headers['x-ratelimit-remaining']);
          const chunks = [];

          res
            .on('data', data => {
              chunks.push(data);
            })
            .on('end', () => {
              const allChunks = Buffer.concat(chunks);
              const data = JSON.parse(allChunks);

              if (res.statusCode !== 200) {
                return reject(data);
              } else {
                return resolve(data);
              }
            });
        })
        .on('error', reject);
    });
  }

  async getAllCheckins(user) {
    const { stats } = await this.getUserInfo(user);

    if (!stats) {
      return [];
    }

    const totalCheckins = stats.total_checkins;
    const requestsNeeded = Math.ceil(totalCheckins / 50);
    const shardsNeeded = Math.ceil(totalCheckins / 200);
    let shardId = shardsNeeded;
    let requests = 0;
    let lastCheckin = null;
    let checkins = [];
    let shardCheckins = [];

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(requestsNeeded, requests);

    while (requests <= requestsNeeded) {
      const resp = await this.getCheckins(user, lastCheckin);

      if (resp.checkins.length === 0) {
        break;
      }

      if (resp.pagination.max_id) {
        lastCheckin = resp.pagination.max_id;
      }

      shardCheckins = shardCheckins.concat(resp.checkins.items);

      if (shardCheckins.length >= 200) {
        checkins = [{ shardId, checkins: shardCheckins }, ...checkins];
        shardCheckins = [];
        shardId -= 1;
      }

      requests += 1;
      bar.update(requests);
    }

    bar.stop();

    console.log(`Last checkin was: ${lastCheckin}`);

    return checkins;
  }

  async getCheckins(user, startWith = null) {
    const endpoint = `user/checkins/${user}`;
    const options = {
      limit: 50,
    };

    if (startWith) {
      options.max_id = startWith;
    }

    try {
      const { response } = await this.get(endpoint, options);
      return response;
    } catch (e) {
      console.error('Error in `getCheckins`:');
      console.error(e);
      return {
        status: e.meta.code,
        error_type: e.meta.error_type,
        error_detail: e.meta.error_detail,
        checkins: [],
      };
    }
  }

  async getUserInfo(user) {
    const endpoint = `user/info/${user}`;

    try {
      const { response } = await this.get(endpoint, { compact: 'true' });
      return response.user;
    } catch (e) {
      console.error('Error in `getUserInfo`:');
      console.error(e);
      return {
        status: e.meta.code,
        error_type: e.meta.error_type,
        error_detail: e.meta.error_detail,
      };
    }
  }

  saveData(data, user) {
    try {
      fs.writeFileSync(path.resolve(__dirname, `../data/${user}.json`), JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }

  async run() {
    try {
      const resp = await this.getAllCheckins('oharak17');
      this.saveData(resp, 'oharak17');
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

module.exports = UntappdGetter;
