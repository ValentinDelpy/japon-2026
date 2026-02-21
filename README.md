# ⛩️ Little Domo Very Arigato — 日本の旅

Application interactive de planification de voyage au Japon.

## Fonctionnalités

- **Dashboard** : Vue d'ensemble avec carte interactive, statistiques, budget, timeline
- **Itinéraire** : Tableau complet des données du spreadsheet, cartes de synthèse par ville
- **Fiches Voyage** : Guides détaillés pour chaque destination (activités, restos, anecdotes, conseils)
- **Impression** : Vue calendrier + carte, optimisée pour l'impression PDF

## Données en temps réel

L'application se connecte automatiquement au Google Spreadsheet pour récupérer les données en temps réel.
Le taux de change EUR → JPY est mis à jour automatiquement via une API externe.

### Configuration du Spreadsheet

Le spreadsheet doit être **publié sur le web** (Fichier → Partager → Publier sur le web) pour que l'application puisse le lire.

L'ID du spreadsheet est configuré dans `js/data.js` :
```javascript
const SHEET_ID = '1ZOze3lbKEsa-nJpt30hhA8rlrZlkC0y295NkH_GLnJ4';
```

## Déploiement sur GitHub Pages

1. Créer un repository GitHub
2. Pousser tous les fichiers du projet
3. Aller dans Settings → Pages
4. Sélectionner la branche `main` et le dossier `/ (root)`
5. Le site sera accessible à `https://votre-username.github.io/nom-du-repo/`

## Structure du projet

```
├── index.html          # Point d'entrée SPA
├── css/
│   └── style.css       # Styles (design system japonais)
├── js/
│   ├── app.js          # Router, initialisation, menu mobile
│   ├── data.js         # Service de données (Google Sheets + taux de change)
│   ├── destinations.js # Base de données des guides de voyage
│   └── pages.js        # Renderers des 4 pages
└── README.md
```

## Technologies

- Vanilla HTML/CSS/JS (aucune dépendance de build)
- Leaflet.js (cartes interactives, via CDN)
- Google Sheets API (gviz endpoint, lecture seule)
- API de taux de change (open.er-api.com)
- Google Fonts (Noto Serif JP, DM Sans, Space Mono)

## Responsive

L'application est entièrement responsive avec :
- Sidebar fixe sur desktop
- Menu hamburger sur mobile/tablette
- Grilles adaptatives pour les cartes et statistiques
- Vue impression optimisée
