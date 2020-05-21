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

  add(user, data) {
    const { checkins, info } = data;

    const parentClient = new faunadb.Client({ secret: this.secret });
    return parentClient
      .query(q.Exists(q.Database(user)))
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
}

module.exports = Fauna;
