import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { QueryResult } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type {
  User,
  Database,
  Checkin,
  CheckinWithData,
  PaginatedCheckins,
  Brewery,
  Beer,
  Venue,
} from '@types';

dotenv.config();

const CHECKINS_PER_PAGE = 32;

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
   * @return CheckinWithData[]
   */
  public async getLatestCheckins(): Promise<CheckinWithData[]> {
    const { data, error } = await this.checkinsWithDataQuery().limit(10);

    if (error) throw error;

    return data as QueryResult<CheckinWithData[]>;
  }

  /**
   * Gets a brewery by slug.
   *
   * @param {string} slug Brewery slug.
   *
   * @return Brewery
   */
  public async getBrewery(slug: string): Promise<Brewery> {
    const { data, error, status } = await this.supabase
      .from('breweries')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (status === 406) {
        return null;
      }

      throw error;
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
   * Gets all checkins of beers from a specific brewery.
   *
   * @param {string} id Brewery ID.
   *
   * @return CheckinWithData[]
   */
  public async getBreweryCheckins(id: string, page = 1): Promise<PaginatedCheckins> {
    const { data, error, count } = await this.checkinsWithDataQuery(page).eq('brewery', id);

    if (error) throw error;

    return {
      checkins: data as QueryResult<CheckinWithData[]>,
      count,
    };
  }

  /**
   * Gets all checkins for a beer.
   *
   * @param {string} id Beer ID.
   *
   * @return CheckinWithData[]
   */
  public async getBeerCheckins(id: string, page = 1): Promise<PaginatedCheckins> {
    const { data, error, count } = await this.checkinsWithDataQuery(page).eq('beer', id);

    if (error) throw error;

    return {
      checkins: data as QueryResult<CheckinWithData[]>,
      count,
    };
  }

  /**
   * Gets an individual beer by slug.
   *
   * @param {string} slug Beer slug.
   *
   * @return Beer
   */
  public async getBeer(slug: string): Promise<Beer> {
    const { data, error, status } = await this.beersWithDataQuery().eq('slug', slug).single();

    if (error) {
      if (status === 406) {
        return null;
      }

      throw error;
    }

    return data as QueryResult<Beer>;
  }

  /**
   * Do a full-text search of the database.
   *
   * @param {string} query Search query.
   *
   * @return
   */
  public async search(query: string) {
    const { data, error } = await this.supabase.rpc('search_beers_and_breweries', {
      query_text: query,
    });

    if (error) throw error;

    return data;
  }

  // ==============================
  // Helpers

  /**
   * Kick off a checkin query, complete with beer, brewery, and venue data.
   *
   * @return QueryResult
   */
  private checkinsWithDataQuery(page = 1) {
    const rangeStart = (page - 1) * CHECKINS_PER_PAGE;
    const rangeEnd = rangeStart + CHECKINS_PER_PAGE - 1;

    return this.supabase
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
        {
          count: 'exact',
        },
      )
      .order('created_at', { ascending: false })
      .range(rangeStart, rangeEnd);
  }

  /**
   * Kick off a beer query, complete with brewery data.
   *
   * @return QueryResult
   */
  private beersWithDataQuery() {
    return this.supabase.from('beers').select(`
      id,
      name,
      slug,
      label,
      style,
      abv,
      last_had,
      hads,
      average,
      brewery(name, slug)
    `);
  }
}
