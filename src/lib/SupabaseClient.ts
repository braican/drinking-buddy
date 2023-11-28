import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { User, Database, Checkin, Brewery, Beer, Venue } from '@types';

dotenv.config();

export default class SupabaseClient {
  supabase: SupabaseClientType;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error('No Supabase URL or API key found.');
    }

    this.supabase = createClient<Database>(url, key);
  }

  /**
   * Adds a user to the database.
   *
   * @param {User} user User data.
   *
   * @return void
   */
  public async addUser(user: User) {
    const resp = await this.supabase.from('users').upsert({ ...user, last_updated: new Date() });

    if (resp.error) {
      throw new Error(resp.error.message);
    }
  }

  /**
   * Adds a list of checkins to the database.
   *
   * @param {Checkin[]} checkins Checkins to add.
   *
   * @return void
   */
  public async addCheckins(checkins: Checkin[]) {
    const { error } = await this.supabase.from('checkins').upsert(checkins);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Adds breweries to the database.
   *
   * @param {Brewery[]} breweries Breweries to add.
   *
   * @return void
   */
  public async addBreweries(breweries: Brewery[]): Promise<void> {
    const { error } = await this.supabase.from('breweries').upsert(breweries);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Adds venues to the database.
   *
   * @param {Venue[]} venues Venues to add.
   *
   * @return void
   */
  public async addVenues(venues: Venue[]): Promise<void> {
    const { error } = await this.supabase.from('venues').upsert(venues);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Adds beers to the database.
   *
   * @param {Beer[]} beers Beers to add.
   *
   * @return void
   */
  public async addBeers(beers: Beer[]): Promise<void> {
    const { error } = await this.supabase.from('beers').upsert(beers);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Gets the user from the database.
   *
   * @return User
   */
  public async getUser(): Promise<User> {
    const { data, error } = await this.supabase.from('users').select('*').single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
