import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { User, Database, Checkin, Brewery, Beer, Venue } from '@types';

dotenv.config();

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;

export default class SupabaseClient {
  supabase: SupabaseClientType;

  checkinsWithDataQuery;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error('No Supabase URL or API key found.');
    }

    this.supabase = createClient<Database>(url, key);

    this.checkinsWithDataQuery = this.supabase
      .from('checkins')
      .select(
        `
      id,
      created_at,
      comment,
      rating,
      beer(name, slug, style),
      brewery(name),
      venue(name)
    `,
      )
      .order('created_at', { ascending: true });
  }

  // ==============================
  // ADDERS

  /**
   * Adds a user to the database.
   *
   * @param {User} user User data.
   *
   * @return void
   */
  public async addUser(user: User) {
    const { error } = await this.supabase
      .from('users')
      .upsert({ ...user, last_updated: new Date() });

    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
  }

  // ==============================
  // GETTERS

  /**
   * Gets the user from the database.
   *
   * @return User
   */
  public async getUser(): Promise<User> {
    const { data, error } = await this.supabase.from('users').select('*').single();

    if (error) throw error;

    return data;
  }

  /**
   * Gets the best breweries.
   *
   * @return Brewery[]
   */
  public async getBestBreweries(): Promise<Brewery[]> {
    const { data, error } = await this.supabase
      .from('breweries')
      .select('*')
      .order('average', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data;
  }

  /**
   * Gets the most popular breweries.
   *
   * @return Brewery[]
   */
  public async getMostPopularBreweries(): Promise<Brewery[]> {
    const { data, error } = await this.supabase
      .from('breweries')
      .select('*')
      .order('hads', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data;
  }

  /**
   * Gets the most recent checkins.
   *
   * @return Checkin[]
   */
  public async getLatestCheckins(): Promise<Checkin[]> {
    const { data, error } = await this.checkinsWithDataQuery.limit(10);

    if (error) throw error;

    return data;
  }

  /**
   * Gets a brewery by slug.
   *
   * @param {string} slug Brewery slug.
   *
   * @return Brewery
   */
  public async getBrewery(slug: string): Promise<Brewery> {
    const { data, error } = await this.supabase
      .from('breweries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Gets all beers from a brewery.
   *
   * @param {string} id Brewery ID.
   *
   * @return Beer[]
   */
  public async getBreweryBeers(id: string): Promise<Beer[]> {
    const { data, error } = await this.supabase.from('beers').select('*').eq('brewery', id);

    if (error) throw error;

    return data;
  }

  /**
   * Gets all checkins from a brewery.
   *
   * @param {string} id Brewery ID.
   *
   * @return Checkin[]
   */
  public async getBreweryCheckins(id: string): Promise<Checkin[]> {
    const { data, error } = await this.checkinsWithDataQuery.eq('brewery', id).limit(10);

    if (error) throw error;

    return data;
  }
}
