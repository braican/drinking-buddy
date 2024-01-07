import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { styles } from '../utils/constants.ts'; // Do this so it's available in scripts.
import { mapCheckins } from '../utils/mapCheckins.ts';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type {
  User,
  Database,
  Checkin,
  CheckinWithData,
  PaginatedCheckins,
  Brewery,
  Beer,
  BeerWithData,
  Venue,
  SearchResult,
  FilterParameters,
} from '@types';

dotenv.config();

export default class SupabaseClient {
  supabase: SupabaseClientType;

  CHECKINS_PER_PAGE = 32;

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
   * @return User
   */
  public async addUser(user: User): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .upsert({ ...user, last_updated: new Date() })
      .select()
      .returns<User>();

    if (error) throw error;

    return data;
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
      .gte('hads', 5)
      .order('average', { ascending: false })
      .order('hads', { ascending: false })
      .limit(20);

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
      .order('average', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data;
  }

  /**
   * Returns a list of the best and most popular brewries based on the most reent checkins.
   *
   * @return Brewery[]
   */
  public async getRecentBreweryRankings(): Promise<{
    best: Brewery[];
    popular: Brewery[];
  }> {
    const baseCheckinsPerPage = this.CHECKINS_PER_PAGE;
    this.CHECKINS_PER_PAGE = 1000;
    const { data, error } = await this.checkinsWithDataQuery().returns<CheckinWithData[]>();
    this.CHECKINS_PER_PAGE = baseCheckinsPerPage;

    if (error) throw error;

    const { breweries } = mapCheckins(data);

    const best = breweries.filter(b => b.hads > 3).slice(0, 20);
    const popular = breweries.sort((a, b) => b.hads - a.hads).slice(0, 20);

    return {
      best,
      popular,
    };
  }

  /**
   * Gets the most recent checkins.
   *
   * @param {number} page Page to get.
   *
   * @return PaginatedCheckins
   */
  public async getCheckins(page = 1): Promise<PaginatedCheckins> {
    const { data, error, count } = await this.checkinsWithDataQuery(page).returns<
      CheckinWithData[]
    >();

    if (error) throw error;

    return {
      checkins: data,
      count,
    };
  }

  /**
   * Gets a brewery by slug or by ID.
   *
   * @param {object} params
   *  - slug Brewery slug.
   *  - id   Brewry ID
   *
   * @return Brewery
   */
  public async getBrewery(params: { slug?: string; id?: number }): Promise<Brewery | null> {
    const slug = params.slug;
    const id = params.id;

    if (!slug && !id) {
      return null;
    }

    const query = this.supabase.from('breweries').select('*');

    if (slug) {
      query.eq('slug', slug);
    } else {
      query.eq('id', id);
    }

    const { data, error } = await query.returns<Brewery>().maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Gets a brewery by ID.
   *
   * @param {number[]} ids Brewery IDs.
   *
   * @return Brewery
   */
  public async getBreweriesById(ids: number[]): Promise<Brewery[]> {
    const { data, error } = await this.supabase
      .from('breweries')
      .select('*')
      .in('id', ids)
      .returns<Brewery[]>();

    if (error) throw error;

    return data;
  }

  /**
   * Deletes a brewery reecord.
   *
   * @param {number} id Brewery ID.
   *
   * @return void
   */
  public async deleteBrewery(id: number): Promise<void> {
    if (!id) {
      return;
    }

    const { error } = await this.supabase.from('breweries').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Deletes a Beer reecord.
   *
   * @param {number} id Beer ID.
   *
   * @return void
   */
  public async deleteBeer(id: number): Promise<void> {
    if (!id) {
      return;
    }

    const { error } = await this.supabase.from('beers').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Deletes a Venue reecord.
   *
   * @param {number} id Venue ID.
   *
   * @return void
   */
  public async deleteVenue(id: number): Promise<void> {
    if (!id) {
      return;
    }

    const { error } = await this.supabase.from('venues').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Gets all beers from a brewery.
   *
   * @param {string} id Brewery ID.
   *
   * @return Beer[]
   */
  public async getBreweryBeers(id: string): Promise<Beer[]> {
    const { data, error } = await this.supabase
      .from('beers')
      .select('*')
      .eq('brewery', id)
      .returns<Beer[]>();

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
    const { data, error, count } = await this.checkinsWithDataQuery(page)
      .eq('brewery', id)
      .returns<CheckinWithData[]>();

    if (error) throw error;

    return {
      checkins: data,
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
    const { data, error, count } = await this.checkinsWithDataQuery(page)
      .eq('beer', id)
      .returns<CheckinWithData[]>();

    if (error) throw error;

    return {
      checkins: data,
      count,
    };
  }

  /**
   * Gets all checkins for a venue.
   *
   * @param {string} id Venue ID.
   *
   * @return PaginatedCheckins
   */
  public async getVenueCheckins(id: string, page = 1): Promise<PaginatedCheckins> {
    const { data, error, count } = await this.checkinsWithDataQuery(page)
      .eq('venue', id)
      .returns<CheckinWithData[]>();

    if (error) throw error;

    return {
      checkins: data,
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
  public async getBeer(slug: string): Promise<BeerWithData | null> {
    const { data, error } = await this.beersWithDataQuery()
      .eq('slug', slug)
      .returns<BeerWithData>()
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Gets an individual beer by ID.
   *
   * @param {number[]} ids Beer IDs.
   *
   * @return Beer[]
   */
  public async getBeersById(ids: number[]): Promise<Beer[]> {
    const { data, error } = await this.supabase
      .from('beers')
      .select('*')
      .in('id', ids)
      .returns<Beer[]>();

    if (error) throw error;

    return data;
  }

  /**
   * Do a full-text search of the database.
   *
   * @param {string} query Search query.
   *
   * @return SearchResult[]
   */
  public async search(query: string): Promise<SearchResult[]> {
    const { data, error } = await this.supabase.rpc('search_beers_and_breweries', {
      query_text: query,
    });

    if (error) throw error;

    return data;
  }

  /**
   * Gets filtered checkins.
   *
   * @param {object} filters Filters to apply.
   *
   * @return CheckinWithData[]
   */
  public async getFilteredCheckins(
    filters: FilterParameters = {},
    page = 1,
  ): Promise<PaginatedCheckins> {
    if (!filters.style && !filters.state && !filters.year) {
      return {
        checkins: [],
        count: 0,
      };
    }

    let query = this.checkinsWithDataQuery(page);

    if (filters.style) {
      const mappedStyles = styles[filters.style];
      if (mappedStyles) {
        const orClaue = mappedStyles.map(s => `style.eq.${s}`).join(',');
        query = query.or(orClaue, { referencedTable: 'beer' });
      }
    }
    if (filters.state) query = query.eq('brewery.state', filters.state.toUpperCase());
    if (filters.year) {
      query = query
        .lt('created_at', `${parseInt(filters.year) + 1}-01-01`)
        .gte('created_at', `${filters.year}-01-01`);
    }

    const { data, error, count } = await query.returns<CheckinWithData[]>();

    if (error) throw error;

    return {
      checkins: data,
      count,
    };
  }

  /**
   * Get the date of the last checkin.
   *
   * @return number
   */
  public async getLastCheckin(): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('checkins')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return data.id ?? null;
  }

  /**
   * Get the number of checkin rows in the database.
   *
   * @return number
   */
  public async getCheckinCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('checkins')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;

    return count;
  }

  /**
   * Gets a single checkin by ID.
   *
   * @param {number} id Checkin ID.
   *
   * @return Checkin
   */
  public async getCheckinById(id: number): Promise<Checkin | null> {
    const { data, error } = await this.supabase
      .from('checkins')
      .select('*')
      .eq('id', id)
      .returns<Checkin>()
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Gets a single venue by slug.
   *
   * @return Venue|null
   */
  public async getVenue(slug: string): Promise<Venue | null> {
    const { data, error } = await this.supabase
      .from('venues')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  /**
   * Gets a venue by ID.
   *
   * @param {number[]} ids Venue IDs.
   *
   * @return Venue[]
   */
  public async getVenuesById(ids: number[]): Promise<Venue[]> {
    const { data, error } = await this.supabase
      .from('venues')
      .select('*')
      .in('id', ids)
      .returns<Venue[]>();

    if (error) throw error;

    return data;
  }

  // ==============================
  // Helpers

  /**
   * Kick off a checkin query, complete with beer, brewery, and venue data.
   *
   * @return PostgresFilterBuilder
   */
  private checkinsWithDataQuery(page = 1) {
    const rangeStart = (page - 1) * this.CHECKINS_PER_PAGE;
    const rangeEnd = rangeStart + this.CHECKINS_PER_PAGE - 1;

    return this.supabase
      .from('checkins')
      .select(
        `
          id,
          created_at,
          comment,
          rating,
          beer!inner(id, name, slug, style, hads, average, abv),
          brewery!inner(id, name, state, slug),
          venue(id, name, slug)
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
   * @return PostgresFilterBuilder
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
      total_rating,
      average,
      brewery(name, slug, id)
    `);
  }
}
