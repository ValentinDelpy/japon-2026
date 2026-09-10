import { environment } from '../../environments/environment';

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

let cached: AppConfig | null = null;

/**
 * Configuration au runtime : lit `config.json` (non versionné) sinon `environment.ts`.
 * Permet de publier l'app et de renseigner la clé publique sans rebuild.
 */
export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached;
  let remote: Partial<AppConfig> = {};
  try {
    const res = await fetch('config.json', { cache: 'no-store' });
    if (res.ok) remote = await res.json();
  } catch { /* pas de config.json → on retombe sur environment */ }
  cached = {
    supabaseUrl: remote.supabaseUrl || environment.supabaseUrl,
    supabaseAnonKey: remote.supabaseAnonKey || environment.supabaseAnonKey,
  };
  return cached;
}
