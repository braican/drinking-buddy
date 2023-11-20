import { createClient } from '@supabase/supabase-js';
import type { User, Database } from '@types';

export default class SupabaseClient {
  supabase;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error('No Supabase URL or API key found.');
    }

    this.supabase = createClient<Database>(url, key);
  }

  async addUser(user: User) {
    const resp = await this.supabase.from('users').upsert({ ...user, last_updated: new Date() });

    if (resp.error) {
      throw new Error(resp.error.message);
    }
  }
}
