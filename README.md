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

## Démarrage

```bash
npm install
npm start            # http://localhost:4200
```

L'application lit **exclusivement** Supabase (aucun mode démo). Renseignez
`public/config.json` (voir ci-dessous) : sans clé, l'app affiche une erreur de configuration.

## Configuration Supabase

1. Créer un projet sur https://supabase.com.
2. Appliquer le schéma (deux options) :
   - SQL Editor : exécuter `supabase/migrations/0001_init.sql` puis `0002_improvements.sql` ;
   - ou en ligne de commande : `DATABASE_URL=postgresql://... npm run db:migrate`.
3. Créer un utilisateur dans **Authentication → Users** (email + mot de passe).
4. Lui donner les droits admin :
   ```sql
   insert into admin_users (user_id) values ('<uid de l’utilisateur>');
   ```
5. Importer les données :
   ```bash
   npm run seed                                             # génère public/seed.json
   DATABASE_URL=postgresql://... npm run db:seed            # charge dans PostgreSQL
   ```
6. **Clé publique (runtime)** : renseigner `public/config.json` (non versionné) :
   ```json
   { "supabaseUrl": "https://xxxx.supabase.co", "supabaseAnonKey": "<clé anon publique>" }
   ```
   (copier `public/config.example.json`). La clé `anon` est publique par nature ;
   la clé `service_role` ne doit **jamais** être mise dans le front.
   Sans ce fichier, l'app tourne en mode démo (`public/seed.json`).

Les scripts `db:migrate` / `db:seed` utilisent `DATABASE_URL` (chaîne de connexion PostgreSQL
du projet, à garder secrète).

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

## Mise en ligne (production)

1. **Base de données** : créer un projet Supabase, puis exécuter dans le SQL Editor
   `supabase/migrations/0001_init.sql` **puis** `0002_improvements.sql`.
   Vérifier que RLS est active (lecture publique, écriture admin) et que le bucket `photos` existe.
2. **Compte admin** : Authentication → Users → créer un utilisateur (email + mot de passe),
   puis `insert into admin_users (user_id) values ('<uid>');`.
3. **Variables** : renseigner `src/environments/environment.ts` (URL + clé anon publique).
4. **Données** : `npm run seed` puis `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:supabase`.
5. **Build + déploiement** :
   ```bash
   npm run build -- --base-href /japon-2026/
   npx gh-pages -d dist/ldva/browser
   ```
   (ou publier `dist/ldva/browser` sur la branche `gh-pages`.)

Le backend (PostgreSQL + Auth + Storage) est hébergé par Supabase ; le front reste statique.
Les écritures admin nécessitent une session authentifiée : la sécurité réelle est assurée par RLS,
pas seulement par le guard Angular.

## Sécurité

- RLS activée sur toutes les tables : **lecture publique**, **écriture réservée aux admins** (`admin_users`).
- Le bucket Storage `photos` est public en lecture, protégé en écriture.
- La sécurité réelle est côté PostgreSQL/RLS, pas seulement via le guard Angular.

## Administration (`/admin`)

Accès via le sceau « 印 Administration » (sidebar / menu mobile) ou `/admin`.
Protégé par Supabase Auth + RLS ; en mode démo l'accès est en lecture seule.

Couvre **tout** le contenu du voyage :

- **Voyage** : nom, dates, origine/destination, voyageurs, devise.
- **Étapes & hébergements** : villes, dates, nuits, hôtels, prix, réservations.
- **Transports** : trajets (depuis/vers une étape), mode, horaires, durée, prix.
- **Journées & activités** : date, lieu, titre, heure, catégorie, coût, lien.
- **Réservations** : centralisées (hôtel/resto/transport/activité).
- **Destinations** : fiches (intro, conseils, highlights, fun facts, image, coordonnées).
- **Restaurants · Souvenirs · Phrases · Agenda culturel · Météo · Surprise** : CRUD complet.
- **Packing · Check-list · Moodboard · Japon 101 · Logistique** : éditeurs imbriqués (catégories + éléments).
- **Photos** : upload/suppression dans Supabase Storage.
- **Sauvegarde** : bouton « Exporter » (JSON complet du voyage) dans Contenu.

Confort d'édition :
- Les **nuits sont calculées automatiquement** depuis les dates d'étape (colonne générée).
- L'**hébergement** associe un **nom** à un **lien** (choix principal + alternative).

Les données dérivées (dashboard, timeline, statistiques) sont **calculées** depuis ces tables.

## Modèle de données (extrait)

`trips`, `destinations` (+ `destination_highlights`, `destination_fun_facts`), `stops`, `days`,
`activities`, `transport_legs`, `accommodations`, `reservations`, `restaurants`, `souvenirs`,
`packing_categories`/`packing_items`, `checklist_phases`/`checklist_tasks`, `phrases`,
`cultural_events`, `moodboard_sections`/`moodboard_images`, `photos`, `weather_info`,
`logistics_sections`/`logistics_items`, `japan101_sections`/`japan101_items`, `surprise_items`.

Les données dérivées (timeline, statistiques, dashboard) sont **calculées** à partir de ces tables, jamais dupliquées.
