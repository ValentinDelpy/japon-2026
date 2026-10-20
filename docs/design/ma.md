# Direction « Ma » (間) — refonte v3

> Carte blanche visuelle. Objectif : **plus épuré, plus élégant, même information**.
> Principe : l'espace et la typographie portent la hiérarchie ; on retire le décor (cartes, ombres, bordures, dégradés).

---

## 1. Principes

1. **Papier & encre** : fond papier chaud, texte encre ; un seul accent vermillon.
2. **Typographie d'abord** : display serif, UI sans, données mono. La taille et l'espace créent la hiérarchie.
3. **Cartes maîtrisées** : la carte reste la signature visuelle (bloc net, surface claire, filet 1 px), mais **un seul niveau**, jamais imbriquée. Autour : espace, filets, pas de décor.
4. **Densité par divulgation** : résumé lisible, détail au tap. Aucune information supprimée.
5. **Silence visuel** : pas d'icônes décoratives, pas de dégradés, pas d'animations permanentes.
6. **Mobile-first** : cibles ≥ 44 px, navigation par le pouce, une colonne.

## 2. Tokens

### Couleurs (clair)
| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#F6F3EC` | fond papier |
| `--surface` | `#FFFDF8` | surface des cartes |
| `--surface2` | `#EFEBE2` | survol / bloc |
| `--border` | `#DED8CB` | filet |
| `--border2` | `#C8C0AF` | filet fort |
| `--ink` | `#14130F` | texte |
| `--ink2` | `#4F4A42` | texte secondaire |
| `--ink3` | `#6B655B` | métadonnées (AA) |
| `--accent` | `#B23A2E` | vermillon (unique accent) |
| `--accent-d` | `#8F2C22` | survol |
| `--accent-l` | `#F2E4DF` | fond très léger |
| `--seal` | `#B23A2E` | sceau |

Secondaires (sage, amber, sky, blush, lavender) **conservés pour les statuts mais désaturés**.

### Sombre
`--bg #0E0D0B`, `--surface #16140F`, `--border #2A261D`, `--ink #EDE7DB`, `--accent #D4644C`.

### Rayons
`--r-sm 2px`, `--r-md 6px`, `--r-lg 10px`, `--r-xl 14px`.

### Ombres
`xs/sm: none` ; `md: 0 10px 30px rgba(20,19,15,.06)` (modales) ; `lg/xl: 0 24px 60px rgba(20,19,15,.14)`.

### Typographie
| Rôle | Police | Détail |
|---|---|---|
| Display | **Instrument Serif** | titres, chiffres éditoriaux |
| UI | **Instrument Sans** | corps, labels, navigation |
| Données | **mono système** (`ui-monospace`) | horaires, prix, compteurs |
| Japonais | fallback système (`Hiragino Mincho ProN`, `Yu Mincho`, `Noto Serif JP`) | aucun webfont JP |

Polices **auto-hébergées** (`public/fonts`, 6 woff2, sous-ensembles latin/latin-ext), `preload` des 2 graisses critiques, cache service worker. Aucun CDN de polices.

Échelle : `display 2.6–3.4rem`, `h1 2–2.4rem`, `h2 1.4rem`, `body .95rem`, `meta .72rem` (mono, tracking .08em).

## 3. Composition

- Grille 12 colonnes, gouttière 24 px, largeur max 1200 px.
- Section = eyebrow mono + titre serif + contenu ; filet supérieur.
- **Cartes** : réservées aux unités de contenu (stat, étape, destination, resto, fiche, formulaire admin). Surface `--surface`, filet `--border`, rayon 10 px, ombre quasi nulle. Une seule carte par unité, jamais de carte dans une carte. Survol réservé aux cartes interactives : filet plus net + ombre douce, **sans déplacement**.
- Listes de données : ligne + filet, pas de cartes (sauf si l'unité est une carte).
- Stats : grand chiffre mono/serif + label micro, séparés par filets.
- Tables : filets horizontaux seuls, pas de fond.
- Boutons : rectangle 2 px, uppercase 11 px, tracking .12em ; primaire vermillon, secondaire filet.
- Chips : contour 1 px, 2 px de rayon, pas de pilules.
- Inputs : filet bas ou bord 1 px, fond transparent.

## 4. Navigation

- **Desktop** : sidebar papier 240 px, filet droit ; logo serif ; groupes en micro-label mono ; actif = filet vermillon à gauche, pas de fond.
- **Mobile** : header fin sticky ; bottom nav papier avec filet haut ; actif = vermillon.
- Palette Ctrl+K inchangée fonctionnellement, restylée.
- Compte à rebours et taux : blocs discrets, filets, chiffres mono.

## 5. Motion

- 180–250 ms, `ease-out`.
- Aucun `translateY` au survol ; opacité/filet uniquement.
- `prefers-reduced-motion` respecté.

## 6. Anti-patterns interdits

- **Cartes imbriquées**, ombres lourdes, dégradés décoratifs.
- Cartes partout : une carte doit rester un signal, pas le fond de page.
- Emojis en guise d'icônes de navigation.
- Plusieurs accents colorés concurrents.
- Titres sans hiérarchie, tableaux surchargés.
- Animations permanentes, survols qui font sauter la mise en page.

## 7. Parité d'information (contrat)

| Écran | Doit rester présent |
|---|---|
| Dashboard | trajet, dates, voyageurs, compte à rebours, statut, étapes dépliables (logement/transport/activités/météo/note), carte, prochains jours, budget, notes |
| Sur place | phase, jour X/Y, base, date, lieu visité, progression, prochaine activité, programme, hébergement, liens rapides |
| Itinéraire | carte, convertisseur ¥/€, résumé par base (dates, nuits, logement, activités), jour par jour (visité/base/transports/activités/guide) |
| Timeline | mois, jours, activités |
| Fiches | dates, nuits, highlights, restos, Wikipédia, conseils, fun facts, galerie, guide |
| Statistiques | chiffres clés, répartitions, fun facts |
| Préparation | packing, check-list, logistique (sections + items) |
| Sur place (outils) | restos, découverte, phrasebook, agenda, moodboard, photos, météo, Japon 101, surprise |
| Impression | calendrier, étapes, activités |
| Admin | utilisateurs, voyage, étapes, hébergements, transports (dates), jours (base/visité), activités, réservations, restos, souvenirs, phrases, agenda, météo, surprise, photos, destinations (guide), packing, check-list, moodboard, Japon 101, logistique, contenu |

**Règle** : aucune ligne de ce tableau ne peut disparaître. Si une information passe en second plan, elle reste accessible en ≤ 2 taps.
