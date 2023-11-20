import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { User, Database } from '@types';

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
