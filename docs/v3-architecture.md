# Japon 2026 — Architecture logique v3

> Document de coordination. Objectif : **mêmes fonctionnalités, plus fiables et plus ergonomiques**, en intégrant fidèlement le contenu réel de l'itinéraire.
> Rédigé après audit du code (Angular 20 / Supabase) et lecture de l'onglet Google Sheets « Itinéraire ».

---

## 1. Méthode

1. Auditer l'existant (code, données, déploiement).
2. Comparer la source de vérité (Google Sheets) aux données réelles en base.
3. Proposer une cible logique, puis un plan par phases réversibles.
4. Chaque phase a des critères d'acceptation mesurables.

---

## 2. Évaluation de l'existant

### Forces
- Angular 20 moderne : standalone, signals, **zoneless**, OnPush, lazy loading par route.
- Démarrage durci : `index.html` ~2 kB, bundle initial ~621 kB brut / ~150 kB transféré, **une seule** requête de contenu (`content_snapshot`).
- Sécurité : auth à l'entrée, admin séparé, RLS, RPC `SECURITY DEFINER` pour les comptes, aucun secret dans le front.
- 29 tests unitaires verts ; PWA (service worker) ; déploiement statique automatisé.

### Faiblesses structurantes
| # | Problème | Impact | Priorité |
|---|---|---|---|
| F1 | Modèle **stop-centrique** alors que la source est **jour-centrique** | nuits fausses, villes dupliquées, « visité » ≠ « logement » | **P0** |
| F2 | Dates du voyage en `timestamptz` (ex. `2026-11-16T23:00Z` = 17/11 local) | risque de décalage d'un jour | **P0** |
| F3 | Contenu itinéraire incomplet (8 activités vs ~25 lieux) | app pauvre vs le vrai voyage | **P1** |
| F4 | Transports partiellement renseignés (durées/prix manquants, mode « train » partout, y compris bus) | itinéraire peu fiable | **P1** |
| F5 | `city_jp` vide partout | perte d'identité éditoriale | P2 |
| F6 | Import manuel / non reproductible depuis Sheets | dérive, erreurs, charge de saisie | **P1** |
| F7 | Pas d'e2e, pas d'observabilité (erreurs silencieuses) | régressions et incidents non détectés | P1 |
| F8 | Déploiement = commit du build sur `main` + fallback `404.html` | historique pollué, deep links fragiles | P2 |
| F9 | Admin générique (`entity-editor`) inadapté à l'édition jour par jour | saisie lente et risquée | P1 |

---

## 3. Évaluation du contenu « Itinéraire » (source Sheets)

**Structure du Sheet** : une ligne = un jour, colonnes `Jour, Lieu visité, Lieu logement, Logement, Alternative logement, Prix, Prix/personne, Réservé ?, Activités, Quartier à visiter, Durée trajet, Prix trajet/personne, Billets réservés ?, Infos`.

**Données clés**
- Période : **17/11 → 05/12/2026** (18 jours, ~17 nuits), **4 personnes**.
- Bases de logement réelles (nuits) : Tokyo 4, Kanazawa 2, Takayama 2 (dont excursion Shirakawa-go), Kyoto 2 (excursion Nara), Hiroshima 1, Miyajima 1, Osaka 1 (+ nuit du 01/12 ambiguë), Hakone 1, Tokyo 2.
- Activités/quartiers cités : Résidence impériale, Palais impérial / Tokyo Station / Ginza, Tsukiji, Ueno-Nezu-Yanaka, Harajuku-Shibuya-Shinjuku, Kenroku-en / Higashi Chaya, Ōmichō / Nagamachi / château, Shirakawa-go, vieille ville de Takayama + bœuf de Hida, Sanmachi-suji, Hida-no-Sato, Kasuga Taisha, Itsukushima, Daishō-in, Kuromon Ichiba, Dōtonbori, Hōzenji Yokochō, Owakudani, Minato / TeamLab, Nakano Broadway.
- Transports : Tokyo→Kanazawa (2h30, 90 €/pers), Kanazawa→Shirakawa-go (bus 1h15) → Takayama (50 min), Takayama→Kyoto (3h, 65 €), Kyoto↔Nara (1h30 A/R, 9 €), Kyoto→Hiroshima (2h), Hiroshima→Miyajima (~45 min, 70 €), Miyajima→Osaka (2h30, 65 €), Osaka→Hakone (~3h, 90 €), Hakone→Tokyo (1h30, 20 €).
- Budgets saisis en fin de feuille (totaux et par personne).

### Écart avec l'app (constaté en base)

| Élément | Sheet (attendu) | App actuelle | Écart |
|---|---|---|---|
| Dates voyage | 17/11 → 05/12 | `2026-11-16T23:00Z` → `2026-12-04T23:00Z` | type/fuseau fragile |
| Nombre de stops | 9 bases + excursions | 12 « stops » dont 7 à 0 nuit | modèle |
| Nuits Kanazawa | 2 | 1 | **faux** |
| Nuits Kyoto | 2 | 0 (deux stops Kyoto à 0) | **faux** |
| Nuits Miyajima | 1 | 0 | **faux** |
| Nuits Osaka | 1 (+1 ambigu) | 0 | **faux** |
| Shirakawa-go / Takayama | base Takayama 2 nuits | 2 stops à 0 nuit | visité/logement |
| Nara | excursion (base Kyoto) | stop à 0 nuit | visité/logement |
| Universal Studio | activité | stop à 0 nuit | visité/logement |
| Activités | ~25 | 8 | **contenu manquant** |
| Transports | 11 trajets renseignés | 11, durées/prix partiels | incomplet |
| `city_jp` | renseigné | vide | à compléter |
| Photos | — | 0 | à alimenter |

**Conclusion** : la cause racine n'est pas l'UI mais le **modèle de données**. Tant qu'on modélise des « lieux visités » comme des « stops avec nuits », les nuits resteront fausses.

---

## 4. Vision v3

- **Une seule source de vérité** : le contenu structuré (Sheet → contrat JSON → base), réconcilié et versionné.
- **Modèle jour-centrique** : chaque jour a une base (où l'on dort) et un lieu visité (distinct).
- **Fiabilité par construction** : types de dates corrects, contraintes, import idempotent, e2e, observabilité.
- **Ergonomie mobile d'abord** : itinéraire lisible jour par jour, « Sur place » contextuel, édition rapide.
- **Aucune fonctionnalité supprimée**.

---

## 5. Architecture logique cible

### 5.1 Modèle de domaine (jour-centrique)

```
Trip (1) ──< Stop (base de logement)
  │              └─ check_in / check_out  → nuits calculées
  ├──< Day (1 par date)
  │      ├─ base_stop_id   (où l'on dort)
  │      ├─ visited_place  (ville/quartier visité ce jour)
  │      └──< Activity (heure, titre, lien, coût)
  ├──< TransportLeg (from_stop → to_stop, mode, durée, prix)
  ├──< Reservation (hébergement / transport / activité)
  ├──< Destination (fiche ville : jp, image, intro, highlights)
  └──< Restaurant / Souvenir / Phrase / Culture / Météo / Japon101 / Surprise / Note
```

**Règles**
- `Stop` = **lieu de logement** uniquement. Une excursion (Nara, Shirakawa-go, Universal) n'est pas un `Stop` : c'est un `visited_place` du `Day`.
- Les nuits d'un `Stop` = `check_out − check_in` (et jamais la somme de jours à 0).
- Un `Day` a exactement une date ; `(trip_id, date)` unique.
- Les `Activity` appartiennent à un `Day` (et héritent de sa ville visitée), avec un `stop_id` optionnel pour compatibilité.
- Les `TransportLeg` relient deux `Stop` (ou deux `Day`), avec `mode` typé.

### 5.2 Schéma Supabase cible (additif)

Migrations **additives** : on n'altère pas brutalement l'existant, on ajoute puis on backfill, avec adaptateurs côté front.

```sql
-- Types
create type transport_mode as enum ('train','shinkansen','bus','flight','ferry','walk','car','other');
create type reservation_kind as enum ('lodging','transport','activity','restaurant','other');
create type reservation_status as enum ('pending','reserved','paid','cancelled');

-- Jours : colonne vertébrale
alter table days
  add column if not exists base_stop_id uuid references stops(id) on delete set null,
  add column if not exists visited_place text;
create unique index if not exists days_trip_date_uidx on days(trip_id, date);

-- Activités rattachées au jour
alter table activities add column if not exists day_id uuid references days(id) on delete cascade;
create index if not exists activities_day_idx on activities(day_id);

-- Transports typés
alter table transport_legs add column if not exists mode_v2 transport_mode;

-- Contraintes de cohérence
alter table accommodations
  add constraint accommodations_dates_chk check (check_out is null or check_in is null or check_out > check_in);

-- Vue itinéraire (lecture unique côté front)
create or replace view v_itinerary as
select
  d.trip_id, d.date, d.order_index,
  d.visited_place,
  b.city as base_city,
  jsonb_agg(a order by a.order_index) filter (where a.id is not null) as activities
from days d
left join stops b on b.id = d.base_stop_id
left join activities a on a.day_id = d.id
group by d.id, d.trip_id, d.date, d.order_index, d.visited_place, b.city;
```

> Les colonnes `stops.start_date/end_date` sont conservées mais **documentées comme `check_in`/`check_out`**. Une migration ultérieure pourra les renommer, après adaptateur front.

### 5.3 Sécurité & RLS

- Cible : **lecture = `authenticated` uniquement**, écriture = admin (`is_admin()`), aucune lecture `anon`.
- Auditer les politiques actuelles (`pg_policies`) avant de durcir ; conserver un accès `anon` seulement si un besoin réel existe (ex. page publique).
- `content_snapshot()` reste `SECURITY INVOKER` (RLS appliquée).
- Storage photos : bucket privé + URLs signées, ou bucket public en lecture seule si assumé.
- Aucun secret côté client ; rotation documentée.

### 5.4 Contrat de contenu & import

- `content/itinerary.schema.json` : JSON Schema du voyage (trip, stops, days, activities, transports, accommodations, reservations).
- `scripts/import-itinerary.mjs` :
  - `--file`, `--dry-run`, `--report`.
  - Validation stricte → erreurs lisibles (ligne/colonne).
  - **Upsert idempotent** par clés naturelles (`trip.slug`, `stop(city, check_in)`, `day(date)`, `activity(day, time, title)`).
  - Rapport : `created / updated / unchanged / conflicts`.
  - Transaction unique ; rollback si conflit bloquant.
- Règle : **le Sheet est la source** ; toute correction manuelle en admin est tracée (audit) et signalée au prochain import comme conflit à arbitrer.

### 5.5 Architecture front Angular

```
src/app/
  core/        services, modèles, guards, adaptateurs (données, dates)
  features/    un dossier par domaine, route lazy
  layout/      shell, admin-shell, palette
  shared/      icon, primitives UI réutilisées (panel, badge, field)
```

- `ContentService` expose des **sélecteurs dérivés** (`computed`) : `itineraryByDay`, `nightsByBase`, `nextActivity`, `budgetSummary`.
- **Dates** : manipuler des chaînes `YYYY-MM-DD` et des `time` ; bannir `new Date()` implicite sur des dates de voyage.
- Aucun nouveau state store : signals suffisent.
- Primitives UI uniquement si réutilisées ≥ 2 fois ; sinon styles locaux.

### 5.6 Administration

- Nouvel **éditeur jour-centrique** : liste des jours, sélection d'une base, lieu visité, activités réordonnables, transports.
- Import contrôlé depuis l'admin (dry-run + aperçu du diff) réservé aux admins.
- Audit minimal : `updated_at`, `updated_by` sur les tables éditées.

---

## 6. Fiabilité

| Sujet | Cible |
|---|---|
| Erreurs | `ErrorHandler` global + notification discrète ; logs structurés |
| Réseau | repli `content_snapshot` déjà en place ; retry/backoff sur erreurs transitoires |
| Hors-ligne | bannière explicite ; SW avec prompt de mise à jour (pas de rechargement surprise) |
| Tests | e2e Playwright : login, dashboard, itinéraire, « Sur place », édition admin |
| CI | build prod + tests unitaires + e2e sur PR ; budget de bundle bloquant |
| Données | contraintes SQL + import idempotent + rapport de diff |
| Déploiement | artefact Pages (ou hébergeur avec rewrite SPA) ; arrêter de committer le build sur `main` |

---

## 7. Ergonomie

- **Itinéraire jour par jour** : date, ville visitée, base, activités, transport du jour ; navigation rapide par jour.
- **Sur place** : base actuelle, prochaine activité, logement, liens utiles.
- **Mobile** : navigation par jour collante, cibles ≥ 44 px, pas de tableaux horizontaux.
- **États** : chargement, vide, erreur, hors-ligne sur chaque écran.
- **Accessibilité** : focus visible, contrastes AA, `aria-*`, `prefers-reduced-motion`.
- **Recherche** : palette (Ctrl+K) étendue aux jours/activités ; filtres restos/activités.

---

## 8. Plan par phases

### Phase 0 — Hardening (fait)
Zoneless, snapshot RPC, fonts, Leaflet lazy, fuites, images. **Accepté.**

### Phase 1 — Données v3 & import (P0/P1)
- Migration additive (`days.base_stop_id`, `visited_place`, `activities.day_id`, enums, contraintes, vue).
- Contrat JSON + import idempotent + rapport.
- Backfill : recalcul des nuits, dédoublonnage des villes, réaffectation des activités aux jours.
- **Acceptation** : nuits = Sheet ; 0 stop dupliqué ; ~25 activités importées ; rapport d'import rejouable sans doublon.

### Phase 2 — Admin jour-centrique (P1)
- Éditeur jours/activités/transports ; import dry-run ; audit.
- **Acceptation** : créer/modifier un jour sans toucher aux stops ; diff visible avant import.

### Phase 3 — Ergonomie itinéraire & Sur place (P1)
- Refonte des écrans itinéraire/today sur le modèle jour-centrique ; mobile.
- **Acceptation** : parcours jour→activité en ≤ 2 taps ; états complets ; a11y clavier.

### Phase 4 — Fiabilité (P1)
- ErrorHandler, retry, bannière offline, SW update, e2e CI.
- **Acceptation** : e2e verts ; erreur réseau → message clair sans écran blanc.

### Phase 5 — Déploiement & observabilité (P2)
- Artefact Pages / rewrite SPA ; monitoring d'erreurs ; budgets CI.
- **Acceptation** : deep links OK ; aucun build committé sur `main` ; alerte sur erreurs.

---

## 9. Risques & mitigations

| Risque | Mitigation |
|---|---|
| Migration casse l'app | additive + adaptateurs + feature flag + rollback SQL |
| Import écrase des saisies manuelles | dry-run, diff, règle « source = Sheet », arbitrage explicite |
| Zoneless + mutation hors signal | discipline signals/OnPush ; e2e |
| Deep links GitHub Pages | hash routing ou hébergeur avec rewrite |
| Coût / délai | phases petites, valeur mesurée, pas de refactor spéculatif |

---

## 10. Rôles des agents

| Agent | Rôle | Frontière |
|---|---|---|
| **Coordinateur** (agent principal) | cadrage, specs, arbitrages, Definition of Done | ne code pas les domaines délégués |
| **ui-ux** | design system, parcours, états, a11y, responsive | templates/styles uniquement |
| **frontend-angular** | composants, signals, routing, perf, tests | pas de schéma/RLS |
| **backend-supabase** | schéma, migrations, RLS, RPC, import, storage | pas d'UI |

**Protocole** : le coordinateur écrit la spec → l'agent concerné implémente et vérifie → hand-off (UX→front, besoin data→back) → revue du coordinateur → commit si demandé.

---

## 11. KPIs & Definition of Done

- **Fidélité** : 0 écart entre Sheet et app sur dates, nuits, villes, activités.
- **Fiabilité** : e2e verts, 0 erreur console sur les parcours critiques.
- **Performance** : initial < 650 kB brut, 1 requête de contenu, LCP < 2,5 s sur mobile.
- **Ergonomie** : parcours jour→activité ≤ 2 taps ; Lighthouse a11y ≥ 95.
- **Sécurité** : lecture `authenticated`, écriture admin, aucun secret.
- Une tâche est finie si : fonctionnalité réelle, régressions vérifiées, build + tests verts, responsive/a11y contrôlés, Git clair.

---

## 12. Statut d'avancement (2026-10)

- **Phase 0 — fait** : hardening (zoneless, snapshot RPC, fonts, Leaflet lazy, fuites, images).
- **Phase 1 — fait** : modèle jour-centrique, import idempotent, liens (9 logements + 1 alternative), guides (Kanazawa/Takayama), 17 nuits, 19 jours, 40 activités, 12 trajets datés. Migrations `0006`/`0007`, script `import-itinerary.mjs`, `content/itinerary.json`.
- **Phase 2 — fait** : admin jour-centrique (base + lieu visité), `date` des transports, `guide_url`, payload en liste blanche (corrige l'édition destinations), gestion d'erreurs.
- **Phase 3 — fait** : itinéraire jour par jour (visité/base/transports/activités/guide), « Sur place » affiche le lieu visité, responsive < 640 px.
- **Phase 4 — fait** : `ErrorHandler` global + listeners navigateur, retry ciblé (RPC, erreurs transitoires), bannière hors-ligne + rechargement au retour en ligne, toast accessible, **31 tests**.
- **Phase 5 — en cours** : déploiement GitHub Pages (modèle existant : branche `main` + workflow), vérification live.

### Différé (explicitement)
- Navigation jour sticky + cibles tactiles ≥ 44 px (Phase 3 partielle).
- e2e Playwright (dépendance lourde, à décider).
- Import dry-run depuis l'admin (nécessite une Edge Function admin-only ; le CLI `--dry-run` existe).
- Audit `updated_by` / `updated_at` sur les tables jour-centriques.
- Déploiement par artefact Pages (le modèle actuel commit le build sur `main`, conservé à la demande).
