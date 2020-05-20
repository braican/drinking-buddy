const fs = require('fs');
const path = require('path');
const faunadb = require('faunadb');
const q = faunadb.query;

class Fauna {
  constructor(secret) {
    if (!secret) {
      throw new Error('You must supply a Fauna secret');
    }

    this.secret = secret;
  }

  import(user, file) {
    const client = new faunadb.Client({ secret: `${this.secret}:braican:admin` });

    const data = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
    const json = JSON.parse(data);

    const latestCheckin = json[0].checkin_id;
    const totalCheckins = json.length;
    const shardCount = 200;
    const shardsNeeded = Math.ceil(totalCheckins / shardCount);
    let shardId = 1;
    let shardIndex = 0;
    const checkins = [];

    json.reverse();

    while (shardId <= shardsNeeded) {
      const shardCheckins = json.slice(shardIndex, shardCount + shardIndex);

      checkins.push({ shardId, checkins: shardCheckins });

      shardIndex += shardCount;
      shardId += 1;
    }

    const promises = checkins.map(shard => {
      return client.query(q.Create(q.Collection('checkins'), { data: shard }));
    });

    promises.push(
      client.query(
        q.Create(q.Collection('data'), {
          data: {
            checkin_count: totalCheckins,
            last_checkin: latestCheckin,
          },
        }),
      ),
    );

    Promise.all(promises)
      .then(() => console.log('Added'))
      .catch(error => console.error(error));
  }
}

module.exports = Fauna;
