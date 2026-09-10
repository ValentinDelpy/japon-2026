import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadConfig } from './config';

let client: SupabaseClient | null = null;
let configured = false;

/** Initialise le client Supabase depuis la config runtime. */
export async function initSupabase(): Promise<void> {
  const cfg = await loadConfig();
  if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
    client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    configured = true;
  }
}

export function getSupabase(): SupabaseClient | null { return client; }
export function supabaseConfigured(): boolean { return configured; }
