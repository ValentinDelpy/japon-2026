import { Content } from '../../core/models';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'ref';

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  /** Pour type 'ref' : options dynamiques issues du contenu. */
  optionsFrom?: (c: Content) => { value: string; label: string }[];
  /** Champ liste : textarea ↔ tableau de chaînes. */
  array?: boolean;
  full?: boolean;
}

export interface EntityConfig {
  table: string;
  title: string;
  icon: string;
  singular: string;
  columns: { key: string; label: string }[];
  fields: FieldDef[];
  rows: (c: Content) => any[];
  defaults?: Record<string, unknown>;
}

const stopOptions = (c: Content) => c.stops.map((s) => ({ value: s.id as string, label: s.city }));
const destOptions = (c: Content) => c.destinations.map((d) => ({ value: d.id as string, label: d.name }));

export const ENTITIES: Record<string, EntityConfig> = {
  destinations: {
    table: 'destinations', title: 'Destinations', icon: '🏙️', singular: 'destination',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'name_jp', label: 'Japonais' }, { key: 'slug', label: 'Slug' }],
    fields: [
      { key: 'name', label: 'Nom' }, { key: 'name_jp', label: 'Nom japonais' }, { key: 'slug', label: 'Slug (clé)' },
      { key: 'image_url', label: 'Image (URL)', full: true },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      { key: 'tips', label: 'Conseils', type: 'textarea' },
      { key: 'highlights', label: 'À ne pas manquer (une par ligne)', type: 'textarea', array: true },
      { key: 'funFacts', label: 'Le saviez-vous ? (un par ligne)', type: 'textarea', array: true },
      { key: 'lat', label: 'Latitude', type: 'number' }, { key: 'lng', label: 'Longitude', type: 'number' },
    ],
    rows: (c) => c.destinations,
  },
  restaurants: {
    table: 'restaurants', title: 'Restaurants', icon: '🍜', singular: 'restaurant',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'city', label: 'Ville' }, { key: 'type', label: 'Type' }, { key: 'price', label: 'Prix' }],
    fields: [
      { key: 'name', label: 'Nom' }, { key: 'destination_id', label: 'Destination', type: 'ref', optionsFrom: destOptions },
      { key: 'city', label: 'Ville' },
      { key: 'type', label: 'Type', type: 'select', options: ['Ramen', 'Sushi', 'Izakaya', 'Tempura', 'Marché', 'Kaiseki', 'Okonomiyaki', 'Takoyaki', 'Pâtisserie', 'Végétarien', 'Soba', 'Tonkatsu', 'Gyudon', 'Yakiniku', 'Nabe', 'Kushikatsu', 'Konbini'] },
      { key: 'price', label: 'Prix' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tip', label: 'Astuce' }, { key: 'address', label: 'Adresse' }, { key: 'url', label: 'URL' },
      { key: 'favorite', label: 'Favori', type: 'checkbox' },
    ],
    rows: (c) => c.restaurants,
    defaults: { status: 'idea', favorite: false },
  },
  souvenirs: {
    table: 'souvenirs', title: 'Souvenirs', icon: '🛍️', singular: 'souvenir',
    columns: [{ key: 'name', label: 'Objet' }, { key: 'city', label: 'Ville' }, { key: 'category', label: 'Catégorie' }, { key: 'price', label: 'Prix' }],
    fields: [
      { key: 'name', label: 'Objet' }, { key: 'city', label: 'Ville' }, { key: 'category', label: 'Catégorie' },
      { key: 'icon', label: 'Emoji' }, { key: 'price', label: 'Prix' }, { key: 'shop', label: 'Boutique' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'priority', label: 'Priorité', type: 'select', options: ['', 'haute', 'moyenne', 'basse'] },
      { key: 'bought', label: 'Acheté', type: 'checkbox' },
    ],
    rows: (c) => c.souvenirs,
    defaults: { bought: false },
  },
  phrases: {
    table: 'phrases', title: 'Phrases', icon: '🗣️', singular: 'phrase',
    columns: [{ key: 'fr', label: 'Français' }, { key: 'jp', label: 'Japonais' }, { key: 'category', label: 'Catégorie' }],
    fields: [
      { key: 'fr', label: 'Français' }, { key: 'jp', label: 'Japonais' }, { key: 'romaji', label: 'Romaji' },
      { key: 'pronunciation', label: 'Prononciation' }, { key: 'category', label: 'Catégorie' }, { key: 'category_icon', label: 'Emoji catégorie' },
      { key: 'favorite', label: 'Favori', type: 'checkbox' },
    ],
    rows: (c) => c.phrases,
    defaults: { favorite: false },
  },
  cultural_events: {
    table: 'cultural_events', title: 'Agenda culturel', icon: '🎌', singular: 'événement',
    columns: [{ key: 'name', label: 'Événement' }, { key: 'city', label: 'Ville' }, { key: 'date', label: 'Date' }, { key: 'type', label: 'Type' }],
    fields: [
      { key: 'name', label: 'Événement' }, { key: 'city', label: 'Ville' }, { key: 'city_jp', label: 'Ville (JP)' },
      { key: 'date', label: 'Date (texte)' }, { key: 'date_label', label: 'Période du séjour' },
      { key: 'type', label: 'Type' }, { key: 'emoji', label: 'Emoji' }, { key: 'price', label: 'Prix' },
      { key: 'description', label: 'Description', type: 'textarea' }, { key: 'tip', label: 'Astuce' }, { key: 'url', label: 'URL' },
    ],
    rows: (c) => c.culturalEvents,
  },
  weather_info: {
    table: 'weather_info', title: 'Météo & saison', icon: '🌤️', singular: 'ville',
    columns: [{ key: 'city', label: 'Ville' }, { key: 'high', label: 'Max' }, { key: 'low', label: 'Min' }, { key: 'koyo', label: 'Koyo' }],
    fields: [
      { key: 'city', label: 'Ville' }, { key: 'city_jp', label: 'Ville (JP)' }, { key: 'icon', label: 'Emoji' },
      { key: 'high', label: 'Max °C', type: 'number' }, { key: 'low', label: 'Min °C', type: 'number' },
      { key: 'rain', label: 'Jours de pluie', type: 'number' }, { key: 'koyo', label: 'Koyo' },
      { key: 'tips', label: 'Conseils (un par ligne)', type: 'textarea', array: true },
    ],
    rows: (c) => c.weather,
  },
  surprise_items: {
    table: 'surprise_items', title: 'Surprise', icon: '🎲', singular: 'élément',
    columns: [{ key: 'text', label: 'Texte' }, { key: 'type', label: 'Type' }, { key: 'city', label: 'Ville' }],
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['highlight', 'restaurant', 'activite'] },
      { key: 'city', label: 'Ville' }, { key: 'icon', label: 'Emoji' }, { key: 'price', label: 'Prix' },
      { key: 'text', label: 'Texte', type: 'textarea' },
    ],
    rows: (c) => c.surpriseItems,
  },
  transport_legs: {
    table: 'transport_legs', title: 'Transports', icon: '🚄', singular: 'trajet',
    columns: [{ key: 'mode', label: 'Mode' }, { key: 'duration', label: 'Durée' }, { key: 'price', label: 'Prix' }, { key: 'reserved', label: 'Réservé' }],
    fields: [
      { key: 'from_stop_id', label: 'Depuis', type: 'ref', optionsFrom: stopOptions },
      { key: 'to_stop_id', label: 'Vers', type: 'ref', optionsFrom: stopOptions },
      { key: 'mode', label: 'Mode', type: 'select', options: ['train', 'shinkansen', 'metro', 'bus', 'avion', 'taxi', 'marche', 'ferry', 'autre'] },
      { key: 'departure_time', label: 'Départ' }, { key: 'arrival_time', label: 'Arrivée' }, { key: 'duration', label: 'Durée' },
      { key: 'line', label: 'Ligne' }, { key: 'reference', label: 'Référence' }, { key: 'price', label: 'Prix (€)', type: 'number' },
      { key: 'reserved', label: 'Réservé', type: 'checkbox' }, { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    rows: (c) => c.transportLegs,
    defaults: { reserved: false, mode: 'train' },
  },
  accommodations: {
    table: 'accommodations', title: 'Hébergements', icon: '🏨', singular: 'hébergement',
    columns: [{ key: 'name', label: 'Nom' }, { key: 'check_in', label: 'Arrivée' }, { key: 'price_total', label: 'Prix' }, { key: 'reserved', label: 'Réservé' }],
    fields: [
      { key: 'stop_id', label: 'Étape', type: 'ref', optionsFrom: stopOptions },
      { key: 'name', label: 'Nom' }, { key: 'alt_name', label: 'Alternative' },
      { key: 'url', label: 'Lien', full: true }, { key: 'address', label: 'Adresse', full: true },
      { key: 'check_in', label: 'Arrivée', type: 'date' }, { key: 'check_out', label: 'Départ', type: 'date' },
      { key: 'price_total', label: 'Prix total (€)', type: 'number' }, { key: 'price_per_person', label: 'Prix / pers. (€)', type: 'number' },
      { key: 'reservation_number', label: 'N° réservation' }, { key: 'reserved', label: 'Réservé', type: 'checkbox' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    rows: (c) => c.accommodations,
    defaults: { reserved: false },
  },
};
