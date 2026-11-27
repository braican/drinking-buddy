import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '$app/env/private';
import SupabaseClient from '../SupabaseClient.ts';

/** A Supabase client configured from the server environment. */
export function getSupabase() {
  return new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}
