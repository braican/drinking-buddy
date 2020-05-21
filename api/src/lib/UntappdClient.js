const https = require('https');
const queryString = require('querystring');
const cliProgress = require('cli-progress');

const API_BASE = 'https://api.untappd.com/v4/';

class UntappdClient {
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
    const shardCount = 200;
    const requestsNeeded = Math.ceil(totalCheckins / 50);
    let requests = 0;
    let oldestCheckin = null;
    let checkins = [];
    let shardId = Math.ceil(totalCheckins / shardCount);
    const shards = [];

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(requestsNeeded, requests);

    while (requests <= requestsNeeded) {
      const resp = await this.getCheckins(user, oldestCheckin);

      if (resp.checkins.items.length < 1) {
        break;
      }

      if (resp.pagination.max_id) {
        oldestCheckin = resp.pagination.max_id;
      }

      checkins = checkins.concat(resp.checkins.items);
      requests += 1;
      bar.update(requests);
    }

    const latestCheckin = checkins[0].checkin_id;
    const checkinCount = checkins.length;

    checkins.reverse();

    while (checkins.length > 0) {
      const shardCheckins = checkins.splice(0, shardCount);
      shards.push({ shardId, checkins: shardCheckins });
      shardId += 1;
    }

    bar.stop();

    return {
      checkins: shards,
      info: {
        checkin_count: checkinCount,
        latest_checkin: latestCheckin,
        oldest_checkin: oldestCheckin,
        complete: checkinCount === totalCheckins,
      },
    };
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
        checkins: { count: 0, items: [] },
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
}

module.exports = UntappdClient;
