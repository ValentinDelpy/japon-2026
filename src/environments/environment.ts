// Configuration Supabase.
// La clé « anon » est publique par nature (protégée par RLS).
// Ne JAMAIS mettre la clé service_role ici.
export const environment = {
  production: false,
  supabaseUrl: '',   // ex: https://xxxx.supabase.co
  supabaseAnonKey: '', // clé anon publique
  // Si vide, l'app fonctionne en mode démo avec public/seed.json.
};
