const fs = require('fs');
const path = require('path');
const { ApiError } = require('../handlers');
const faunadb = require('faunadb');
const q = faunadb.query;

class Fauna {
  constructor(secret) {
    if (!secret) {
      throw new Error('You must supply a Fauna secret');
    }

    this.secret = secret;
  }

  createDatabase(user) {
    const parentClient = new faunadb.Client({ secret: this.secret });

    return new Promise((resolve, reject) => {
      parentClient
        .query(q.CreateDatabase({ name: user }))
        .then(() => {
          const childClient = new faunadb.Client({ secret: `${this.secret}:${user}:admin` });
          childClient
            .query(
              q.Map(
                ['checkins', 'info'],
                q.Lambda('collectionName', q.CreateCollection({ name: q.Var('collectionName') })),
              ),
            )
            .then(() => resolve(childClient))
            .catch(error => {
              console.error('Error while creating the database collections.');
              console.error(error);
              reject(error);
            });
        })
        .catch(error => {
          console.error('Error while creating the database.');
          console.error(error);
          reject(error);
        });
    });
  }

  dbExists(dbName) {
    const parentClient = new faunadb.Client({ secret: this.secret });

    return parentClient.query(q.Exists(q.Database(dbName)));
  }

  add(user, data) {
    const { checkins, info } = data;

    return this.dbExists(user)
      .then(exists => {
        if (exists) {
          return new faunadb.Client({ secret: `${this.secret}:${user}:admin` });
        }

        return this.createDatabase(user);
      })
      .then(client => {
        const promises = checkins.map(shard => {
          return client.query(q.Create(q.Collection('checkins'), { data: shard }));
        });

        promises.push(
          client.query(
            q.Create(q.Collection('info'), {
              data: { ...info },
            }),
          ),
        );

        return Promise.all(promises).then(() => console.log('Added'));
      })

      .catch(error => {
        console.error('Error in the `add` method.');
        console.error(error);
        throw new Error();
      });
  }

  import(user, file) {
    const data = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
    return this.add(user, data)
      .then('Imported')
      .catch(error => {
        console.error('Error in the `import` method.');
        console.error(error);
        throw new Error();
      });
  }

  getCheckins(user) {
    return this.dbExists(user)
      .then(exists => {
        if (!exists) {
          throw new ApiError(404, `That user doesn't exist.`);
        }
        return new faunadb.Client({ secret: `${this.secret}:${user}:admin` });
      })
      .then(client => {
        return client
          .query(
            q.Map(
              q.Paginate(q.Match(q.Index('shards'))),
              q.Lambda(['x', 'ref'], q.Get(q.Var('ref'))),
            ),
          )
          .then(ret => {
            const beers = {};

            ret.data.forEach(shard => {
              shard.data.checkins.forEach(({ beer, brewery, created_at }) => {
                if (beers[beer.bid]) {
                  beers[beer.bid].count += 1;
                  beers[beer.bid].last_had = created_at;
                } else {
                  beers[beer.bid] = {
                    count: 1,
                    name: beer.beer_name,
                    brewery: brewery.brewery_name,
                    last_had: created_at,
                  };
                }
              });
            });

            return Object.values(beers).sort((e1, e2) => {
              if (e1.count < e2.count) {
                return 1;
              }

              if (e1.count > e2.count) {
                return -1;
              }

              return 0;
            });
          });
      });
  }
}

module.exports = Fauna;
