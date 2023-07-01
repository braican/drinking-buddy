import { Tigris, FindQueryOptions } from '@tigrisdata/core';
import type { DB, Collection } from '@tigrisdata/core';
import type { Brewery, Checkin, User } from '../../db/models/index.js';

export default class TigrisClient {
  private db: DB;
  private BATCH_SIZE = 200;
  private breweryCollection: Collection<Brewery>;
  private checkinCollection: Collection<Checkin>;
  private userCollection: Collection<User>;

  private constructor() {
    // Prevent direct initialization.
  }

  public static async create(): Promise<TigrisClient> {
    const instance = new TigrisClient();
    await instance.initialize();
    return instance;
  }

  private async initialize(): Promise<void> {
    const client = new Tigris();
    this.db = await client.getDatabase();
    this.breweryCollection = this.db.getCollection<Brewery>('breweries');
    this.checkinCollection = this.db.getCollection<Checkin>('checkins');
    this.userCollection = this.db.getCollection<User>('users');
  }

  // ----- Get

  public async getLastCheckin(): Promise<Checkin> {
    return await this.checkinCollection.findOne({
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
      options: new FindQueryOptions(1, 0),
    });
  }

  public async getCheckinCount(): Promise<number> {
    return await this.checkinCollection.count();
  }

  public async getUser(): Promise<User> {
    return await this.userCollection.findOne({
      filter: {
        username: 'braican',
      },
    });
  }

  public async getLatestCheckins(): Promise<Checkin[]> {
    const checkins = await this.checkinCollection.findMany({
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
      options: new FindQueryOptions(10, 0),
    });

    return await checkins.toArray();
  }

  public async getGlobalStats() {
    const [bestBreweriesCursor, popularBreweriesCursor] = await Promise.all([
      this.breweryCollection.findMany({
        filter: {
          checkinCount: {
            $gt: '5',
          },
        },
        sort: {
          field: 'average',
          order: '$desc',
        },
        options: new FindQueryOptions(10, 0),
      }),
      this.breweryCollection.findMany({
        sort: {
          field: 'checkinCount',
          order: '$desc',
        },
        options: new FindQueryOptions(10, 0),
      }),
    ]);

    const bestBreweries = await bestBreweriesCursor.toArray();
    const popularBreweries = await popularBreweriesCursor.toArray();

    return {
      bestBreweries,
      popularBreweries,
    };
  }

  public async getBrewery(brewerySlug) {
    return await this.breweryCollection.findOne({
      filter: {
        slug: {
          $eq: brewerySlug,
        },
      },
    });
  }

  public async getBreweryCheckins(brewerySlug) {
    const checkins = await this.checkinCollection.findMany({
      filter: {
        'brewery.slug': {
          $eq: brewerySlug,
        },
      },
    });

    return await checkins.toArray();
  }

  // ----- Add

  public async addCheckins(newCheckins: Checkin[]): Promise<number> {
    let totalAdded = 0;

    for (let i = 0; i < newCheckins.length; i += this.BATCH_SIZE) {
      const batch = newCheckins.slice(i, i + this.BATCH_SIZE);
      const insertedCheckins = await this.checkinCollection.insertOrReplaceMany(batch);
      totalAdded += insertedCheckins.length;
      console.log(
        `Batch ${(i + this.BATCH_SIZE) / this.BATCH_SIZE} / ${Math.ceil(
          newCheckins.length / this.BATCH_SIZE,
        )} inserted.`,
      );
    }

    return totalAdded;
  }

  public async addUser(newUser: User): Promise<void> {
    await this.userCollection.insertOrReplaceOne(newUser);
  }

  // ----- Update

  public async updateBreweries(newCheckins: Checkin[] = null): Promise<number> {
    const breweryMap = {};
    let totalAdded = 0;
    const checkins = newCheckins || (await this.checkinCollection.findMany());

    if (!checkins) {
      return 0;
    }

    for await (const ch of checkins) {
      const { slug } = ch.brewery;
      if (!breweryMap[slug]) {
        breweryMap[slug] = { ...ch.brewery, checkinCount: 1, cumulative: ch.rating };
      } else {
        breweryMap[slug].checkinCount += 1;
        breweryMap[slug].cumulative += ch.rating;
      }
    }

    if (newCheckins) {
      const breweriesWithUpdates = await this.breweryCollection.findMany({
        filter: {
          $or: Object.keys(breweryMap).map(brewerySlug => ({ slug: brewerySlug })),
        },
      });

      for await (const brewery of breweriesWithUpdates) {
        if (breweryMap[brewery.slug]) {
          breweryMap[brewery.slug].checkinCount += brewery.checkinCount;
          breweryMap[brewery.slug].cumulative += brewery.cumulative;
        }
      }
    }

    const breweryObjects: Brewery[] = Object.values<Brewery>(breweryMap).map(brewery => ({
      ...brewery,
      average: brewery.cumulative / brewery.checkinCount,
    }));

    for (let i = 0; i < breweryObjects.length; i += this.BATCH_SIZE) {
      const batch = breweryObjects.slice(i, i + this.BATCH_SIZE);
      const insertedBreweries = await this.breweryCollection.insertOrReplaceMany(batch);
      totalAdded += insertedBreweries.length;
      console.log(
        `Batch ${(i + this.BATCH_SIZE) / this.BATCH_SIZE} / ${Math.ceil(
          breweryObjects.length / this.BATCH_SIZE,
        )} inserted.`,
      );
    }

    return totalAdded;
  }
}
