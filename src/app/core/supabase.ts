import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabaseConfigured = !!(environment.supabaseUrl && environment.supabaseAnonKey);

/** Client Supabase partagé (null si non configuré → mode démo seed.json). */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
