// ── Modèles de domaine (une seule source de vérité) ─────────────

export interface Trip {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  origin?: string | null;
  destination?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  travelers: number;
  description?: string | null;
  currency: string;
  theme: string;
  is_active?: boolean;
}

export interface Restaurant {
  id?: string;
  destination_id?: string | null;
  city?: string | null;
  name: string;
  type?: string | null;
  description?: string | null;
  price?: string | null;
  tip?: string | null;
  address?: string | null;
  url?: string | null;
  favorite?: boolean;
  status?: string;
  order_index?: number;
}

export interface Destination {
  id?: string;
  slug: string;
  name: string;
  name_jp?: string | null;
  image_url?: string | null;
  intro?: string | null;
  tips?: string | null;
  lat?: number | null;
  lng?: number | null;
  order_index?: number;
  highlights: string[];
  funFacts: string[];
  restaurants: Restaurant[];
}

export interface Stop {
  id?: string;
  destination_id?: string | null;
  city: string;
  city_jp?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  nights?: number;
  notes?: string | null;
  order_index: number;
}

export interface Day {
  id?: string;
  stop_id?: string | null;
  date: string;
  title?: string | null;
  notes?: string | null;
  order_index: number;
}

export interface Activity {
  id?: string;
  day_id?: string | null;
  stop_id?: string | null;
  time?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  cost?: number | null;
  duration?: string | null;
  link?: string | null;
  lat?: number | null;
  lng?: number | null;
  order_index: number;
}

export interface TransportLeg {
  id?: string;
  from_stop_id?: string | null;
  to_stop_id?: string | null;
  mode?: string | null;
  departure_time?: string | null;
  arrival_time?: string | null;
  duration?: string | null;
  line?: string | null;
  reference?: string | null;
  price?: number | null;
  reserved?: boolean;
  notes?: string | null;
  order_index: number;
}

export interface Accommodation {
  id?: string;
  stop_id?: string | null;
  name: string;
  alt_name?: string | null;
  url?: string | null;
  alt_url?: string | null;
  address?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  price_total?: number | null;
  price_per_person?: number | null;
  reserved?: boolean;
  reservation_number?: string | null;
  notes?: string | null;
}

export interface Reservation {
  id?: string;
  kind: string;
  title: string;
  reference?: string | null;
  date?: string | null;
  time?: string | null;
  price?: number | null;
  status: string;
  url?: string | null;
  notes?: string | null;
  order_index: number;
}

export interface Souvenir {
  id?: string;
  city?: string | null;
  name: string;
  category?: string | null;
  description?: string | null;
  price?: string | null;
  icon?: string | null;
  shop?: string | null;
  priority?: string | null;
  bought?: boolean;
  notes?: string | null;
  order_index?: number;
}

export interface PackingItem {
  id?: string;
  label: string;
  quantity?: string | null;
  required?: boolean;
  priority?: string | null;
  notes?: string | null;
  checked?: boolean;
  order_index?: number;
}
export interface PackingCategory {
  id?: string;
  label: string;
  icon?: string | null;
  order_index?: number;
  items: PackingItem[];
}

export interface ChecklistTask {
  id?: string;
  label: string;
  due_date?: string | null;
  priority?: string | null;
  status?: string;
  link?: string | null;
  done?: boolean;
  order_index?: number;
}
export interface ChecklistPhase {
  id?: string;
  label: string;
  icon?: string | null;
  color?: string | null;
  order_index?: number;
  tasks: ChecklistTask[];
}

export interface Phrase {
  id?: string;
  category: string;
  category_icon?: string | null;
  fr: string;
  jp?: string | null;
  romaji?: string | null;
  pronunciation?: string | null;
  favorite?: boolean;
  order_index?: number;
}

export interface CulturalEvent {
  id?: string;
  city?: string | null;
  city_jp?: string | null;
  date_label?: string | null;
  name: string;
  type?: string | null;
  emoji?: string | null;
  date?: string | null;
  description?: string | null;
  tip?: string | null;
  price?: string | null;
  url?: string | null;
  image_url?: string | null;
  order_index?: number;
}

export interface MoodImage {
  id?: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
  visible?: boolean;
  order_index?: number;
}
export interface MoodSection {
  id?: string;
  city: string;
  name_jp?: string | null;
  color?: string | null;
  visible?: boolean;
  order_index?: number;
  images: MoodImage[];
}

export interface Photo {
  id?: string;
  storage_path: string;
  title?: string | null;
  description?: string | null;
  taken_on?: string | null;
  location?: string | null;
  day_id?: string | null;
  category?: string | null;
  order_index?: number;
}

export interface Japan101Item {
  id?: string;
  question: string;
  answer?: string | null;
  order_index?: number;
}
export interface Japan101Section {
  id?: string;
  icon?: string | null;
  title: string;
  visible?: boolean;
  order_index?: number;
  items: Japan101Item[];
}

export interface WeatherInfo {
  id?: string;
  city: string;
  city_jp?: string | null;
  month?: number | null;
  high?: number | null;
  low?: number | null;
  rain?: number | null;
  icon?: string | null;
  koyo?: string | null;
  description?: string | null;
  tips: string[];
  order_index?: number;
}

export interface LogisticsSection {
  id?: string;
  icon?: string | null;
  title: string;
  color?: string | null;
  order_index?: number;
  items: { id?: string; text: string; order_index?: number }[];
}

export interface SurpriseItem {
  id?: string;
  type: string;
  city?: string | null;
  text: string;
  icon?: string | null;
  price?: string | null;
  order_index?: number;
}

export interface Content {
  trip: Trip | null;
  destinations: Destination[];
  stops: Stop[];
  days: Day[];
  activities: Activity[];
  transportLegs: TransportLeg[];
  accommodations: Accommodation[];
  reservations: Reservation[];
  restaurants: Restaurant[];
  souvenirs: Souvenir[];
  packingCategories: PackingCategory[];
  checklistPhases: ChecklistPhase[];
  phrases: Phrase[];
  culturalEvents: CulturalEvent[];
  moodboardSections: MoodSection[];
  photos: Photo[];
  weather: WeatherInfo[];
  logisticsSections: LogisticsSection[];
  japan101Sections: Japan101Section[];
  surpriseItems: SurpriseItem[];
}

export const EMPTY_CONTENT: Content = {
  trip: null, destinations: [], stops: [], days: [], activities: [], transportLegs: [],
  accommodations: [], reservations: [], restaurants: [], souvenirs: [], packingCategories: [],
  checklistPhases: [], phrases: [], culturalEvents: [], moodboardSections: [], photos: [],
  weather: [], logisticsSections: [], japan101Sections: [], surpriseItems: [],
};
