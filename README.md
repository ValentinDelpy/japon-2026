# ⛩️ Little Domo Very Arigatō — 日本の旅

Application personnelle (Angular + PostgreSQL/Supabase) pour préparer, suivre et documenter un voyage au Japon.
Le site voyageur **et** le panneau d'administration sont alimentés par la **même base de données** (source unique de vérité).

## Stack

- **Frontend** : Angular 20 (standalone components, signals, routing lazy, TypeScript strict).
- **Backend/DB** : Supabase (PostgreSQL + Auth + Storage). Pas de serveur à maintenir.
- **Données** : `public/seed.json` généré depuis l'ancienne app, puis poussé vers PostgreSQL.

```
ADMIN (/admin) ──▶ PostgreSQL (Supabase) ──▶ Angular (site voyageur)
```

## Structure

```
src/app/
  core/          modèles, services (auth, contenu, thème, change, progression), garde admin
  layout/        shell voyageur + shell admin
  features/      dashboard, itinerary, timeline, travel-sheets, statistics, packing,
                 checklist, logistics, restaurants, phrasebook, culture, moodboard,
                 photos, weather, japan-101, surprise, print
  admin/         login, overview, trip, stops, days, activities, reservations, content
supabase/migrations/0001_init.sql   schéma + RLS + storage
scripts/
  migrate-existing-data.mjs         extrait l'ancien site → public/seed.json
  seed-supabase.mjs                 pousse seed.json → PostgreSQL
css/style.css                       design system (partagé, inclus dans le build Angular)
```

## Démarrage (mode démo, sans backend)

```bash
npm install
npm start            # http://localhost:4200
```

Sans configuration Supabase, l'app lit `public/seed.json` (mode démo, lecture seule dans l'admin).

## Configuration Supabase

1. Créer un projet sur https://supabase.com.
2. Exécuter `supabase/migrations/0001_init.sql` (SQL Editor).
3. Renseigner `src/environments/environment.ts` :
   ```ts
   supabaseUrl: 'https://xxxx.supabase.co',
   supabaseAnonKey: '<clé anon publique>',
   ```
4. Créer un utilisateur dans **Authentication → Users** (email + mot de passe).
5. Lui donner les droits admin :
   ```sql
   insert into admin_users (user_id) values ('<uid de l’utilisateur>');
   ```
6. Importer les données :
   ```bash
   SUPABASE_URL=https://xxxx.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<clé service_role> \
   node scripts/seed-supabase.mjs
   ```

La clé `service_role` est **secrète** : elle ne doit jamais être mise dans le code ni commitée.

## Migration du contenu existant

`scripts/migrate-existing-data.mjs` lit le Google Sheet public + `js/destinations.js` + `js/pages-new.js`
et produit `public/seed.json` (destinations, restos, étapes, journées, activités, transports,
hébergements, réservations, souvenirs, packing, check-list, phrases, agenda, moodboard, météo,
logistique, Japon 101, surprises).

```bash
node scripts/migrate-existing-data.mjs
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm start` | serveur de dev → http://localhost:4200 |
| `npm run build` | build production dans `dist/ldva/browser` |
| `npm run preview` | sert le build de prod en local → http://localhost:4300 |
| `npm run seed` | régénère `public/seed.json` depuis l'ancien site |
| `npm run seed:supabase` | pousse `seed.json` vers PostgreSQL |
| `npm test` | tests unitaires (Karma) |

## Lancer en local (le plus simple)

```bash
npm install
npm start
```

L'app démarre en **mode démo** (données `public/seed.json`, admin accessible en lecture seule).
Pour tester le rendu de production avec le service worker (offline) :

```bash
npm run build
npm run preview     # http://localhost:4300
```

## PWA / offline

Un service worker (`ngsw-config.json`) met en cache l'app, les polices, les images et les
réponses API Supabase (`freshness`, 1 jour) : les journées, activités, hôtels, transports,
réservations, phrasebook et checklists restent consultables sans connexion. Les cochettes
(packing/check-list/souvenirs) sont stockées en `localStorage`.

## Déploiement (GitHub Pages)

```bash
npm run build -- --base-href /japon-2026/
# publier dist/ldva/browser sur la branche gh-pages
```

Le backend (Supabase) est hébergé séparément ; le front reste statique.

## Sécurité

- RLS activée sur toutes les tables : **lecture publique**, **écriture réservée aux admins** (`admin_users`).
- Le bucket Storage `photos` est public en lecture, protégé en écriture.
- La sécurité réelle est côté PostgreSQL/RLS, pas seulement via le guard Angular.

## Modèle de données (extrait)

`trips`, `destinations` (+ `destination_highlights`, `destination_fun_facts`), `stops`, `days`,
`activities`, `transport_legs`, `accommodations`, `reservations`, `restaurants`, `souvenirs`,
`packing_categories`/`packing_items`, `checklist_phases`/`checklist_tasks`, `phrases`,
`cultural_events`, `moodboard_sections`/`moodboard_images`, `photos`, `weather_info`,
`logistics_sections`/`logistics_items`, `japan101_sections`/`japan101_items`, `surprise_items`.

Les données dérivées (timeline, statistiques, dashboard) sont **calculées** à partir de ces tables, jamais dupliquées.
