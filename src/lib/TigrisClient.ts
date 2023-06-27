import { Tigris, FindQueryOptions } from '@tigrisdata/core';
import type { DB, Collection } from '@tigrisdata/core';
import type { Checkin, User } from '../../db/models/index.js';

export default class TigrisClient {
  private db: DB;
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
    const checkins = this.checkinCollection.findMany({
      sort: {
        field: 'createdAt',
        order: '$desc',
      },
      options: new FindQueryOptions(10, 0),
    });

    return await checkins.toArray();
  }

  // ----- Add

  public async addCheckins(newCheckins: Checkin[]): Promise<number> {
    let totalAdded = 0;
    const BATCH_SIZE = 200;

    for (let i = 0; i < newCheckins.length; i += BATCH_SIZE) {
      const batch = newCheckins.slice(i, i + BATCH_SIZE);
      const insertedCheckins = await this.checkinCollection.insertOrReplaceMany(batch);
      totalAdded += insertedCheckins.length;
      console.log(
        `Batch ${(i + BATCH_SIZE) / BATCH_SIZE} / ${Math.ceil(
          newCheckins.length / BATCH_SIZE,
        )} inserted.`,
      );
    }

    return totalAdded;
  }

  public async addUser(newUser: User): Promise<void> {
    await this.userCollection.insertOrReplaceOne(newUser);
  }
}
