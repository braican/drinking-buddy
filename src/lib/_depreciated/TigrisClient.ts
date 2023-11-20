import { Tigris, FindQueryOptions, IndexedDoc } from '@tigrisdata/core';
import { styles } from '@utils/constants';
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

  public async getStyles(): Promise<string[]> {
    const checkins = await this.checkinCollection.findMany();

    if (typeof process === 'object' && checkins) {
      const checkinCount = await this.checkinCollection.count();
      console.log(`${checkinCount} checkins fetched.`);
    }

    if (!checkins) {
      return [];
    }

    const styles = [];

    for await (const ch of checkins) {
      if (!styles.includes(ch.beer.style)) {
        styles.push(ch.beer.style);
      }
    }

    return styles.sort((a, b) => (a > b ? 1 : -1));
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

  public async getBestBreweries() {
    const breweries = await this.breweryCollection.findMany({
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
    });

    return await breweries.toArray();
  }

  public async getMostPopularBreweries() {
    const breweries = await this.breweryCollection.findMany({
      sort: {
        field: 'checkinCount',
        order: '$desc',
      },
      options: new FindQueryOptions(10, 0),
    });

    return await breweries.toArray();
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

  public async getFirstBeerCheckin(beerSlug: string) {
    return await this.checkinCollection.findOne({
      filter: {
        'beer.slug': {
          $eq: beerSlug,
        },
      },
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
    });
  }

  public async getBeerCheckins(beerSlug: string) {
    const checkins = await this.checkinCollection.findMany({
      filter: {
        'beer.slug': {
          $eq: beerSlug,
        },
      },
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
    });

    return await checkins.toArray();
  }

  public async getBreweryCheckins(brewerySlug): Promise<Checkin[]> {
    const checkins = await this.checkinCollection.findMany({
      filter: {
        'brewery.slug': {
          $eq: brewerySlug,
        },
      },
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
    });

    return await checkins.toArray();
  }

  public async searchBreweryNames(query: string): Promise<Brewery[]> {
    const results = await this.breweryCollection.search({
      q: query,
      searchFields: ['name'],
      includeFields: ['name', 'slug'],
      sort: [
        {
          field: 'name',
          order: '$asc',
        },
      ],
    });

    const hits: IndexedDoc<Brewery>[] = [];

    for await (const result of results) {
      hits.push(...result.hits);
    }

    return hits.map(({ document }) => document);
  }

  public async getFilteredCheckins(style, state): Promise<Checkin[] | []> {
    const filters = [];

    if (state) {
      filters.push({
        'brewery.state': state.toUpperCase(),
      });
    }

    if (style) {
      const mappedStyles = styles[style];

      if (mappedStyles && mappedStyles.length > 1) {
        filters.push({
          $or: mappedStyles.map(s => ({ 'beer.style': s })),
        });
      } else if (mappedStyles) {
        filters.push({
          'beer.style': mappedStyles[0],
        });
      }
    }

    if (!filters) {
      return [];
    }

    const checkins = await this.checkinCollection.findMany({
      filter: filters.length > 1 ? { $and: filters } : filters[0],
      sort: {
        field: 'createdAt',
        order: '$desc',
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

    if (typeof process === 'object' && newCheckins === null) {
      console.log('Fetching all checkins from database...');
    }

    const checkins = newCheckins || (await this.checkinCollection.findMany());

    if (typeof process === 'object' && newCheckins === null && checkins) {
      const checkinCount = await this.checkinCollection.count();
      console.log(`${checkinCount} checkins fetched.`);
    }

    if (!checkins) {
      return 0;
    }

    for await (const ch of checkins) {
      const { slug } = ch.brewery;
      if (!breweryMap[slug]) {
        breweryMap[slug] = {
          ...ch.brewery,
          checkinCount: 1,
          cumulative: ch.rating,
          ratedCheckins: ch.rating ? 1 : 0,
        };
      } else {
        breweryMap[slug].checkinCount += 1;

        if (ch.rating) {
          breweryMap[slug].cumulative += ch.rating;
          breweryMap[slug].ratedCheckins += 1;
        }
      }
    }

    if (newCheckins) {
      const filter =
        Object.keys(breweryMap).length > 1
          ? {
              $or: Object.keys(breweryMap).map(brewerySlug => ({ slug: brewerySlug })),
            }
          : {
              slug: Object.keys(breweryMap)[0],
            };

      const breweriesWithUpdates = await this.breweryCollection.findMany({ filter });

      for await (const brewery of breweriesWithUpdates) {
        if (breweryMap[brewery.slug]) {
          breweryMap[brewery.slug].checkinCount += brewery.checkinCount;
          breweryMap[brewery.slug].cumulative += brewery.cumulative;
          breweryMap[brewery.slug].ratedCheckins += brewery.ratedCheckins;
        }
      }
    }

    const breweryObjects: Brewery[] = Object.values<Brewery>(breweryMap).map(brewery => ({
      ...brewery,
      average: brewery.cumulative / brewery.ratedCheckins,
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