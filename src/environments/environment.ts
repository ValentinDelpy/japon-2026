// Configuration Supabase (surchargée au runtime par public/config.json).
// La clé « publishable / anon » est publique par nature (protégée par RLS).
// Ne JAMAIS mettre la clé service_role ici.
export const environment = {
  production: false,
  supabaseUrl: '',      // ex: https://xxxx.supabase.co
  supabaseAnonKey: '',  // clé publishable/anon publique
};
