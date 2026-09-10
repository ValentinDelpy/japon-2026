import { Activity, Accommodation, Day, Stop, Trip } from './models';

export interface TodayInput {
  trip: Trip | null;
  stops: Stop[];
  days: Day[];
  activities: Activity[];
  accommodations: Accommodation[];
}

export type TripPhase = 'before' | 'during' | 'after' | 'none';

export interface TodayContext {
  phase: TripPhase;
  date: string;
  dayIndex: number;
  totalDays: number;
  progressPct: number;
  daysUntilStart: number;
  day: Day | null;
  stop: Stop | null;
  accommodation: Accommodation | null;
  activities: Activity[];
  nextActivity: Activity | null;
}

/** Date locale au format YYYY-MM-DD (pas d'UTC pour éviter les décalages). */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_MS = 86400000;
const atMidnight = (iso: string) => new Date(iso + 'T00:00:00').getTime();

/**
 * Contexte « sur place » : où en est le voyage et que se passe-t-il aujourd'hui.
 * Fonction pure → testable sans Angular.
 */
export function resolveToday(input: TodayInput, now: Date): TodayContext {
  const { trip, stops, days, activities, accommodations } = input;
  const date = isoDate(now);
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const totalDays = sortedDays.length;
  const base: TodayContext = {
    phase: 'none', date, dayIndex: 0, totalDays, progressPct: 0, daysUntilStart: 0,
    day: null, stop: null, accommodation: null, activities: [], nextActivity: null,
  };

  if (!trip?.start_date || !trip?.end_date) return base;
  const start = trip.start_date;
  const end = trip.end_date;

  if (date < start) {
    return { ...base, phase: 'before', daysUntilStart: Math.max(0, Math.round((atMidnight(start) - atMidnight(date)) / DAY_MS)) };
  }
  if (date > end) return { ...base, phase: 'after', progressPct: 100 };

  const day = sortedDays.find((d) => d.date === date) ?? null;
  const stop = stops.find((s) => (s.start_date ?? '') <= date && date <= (s.end_date ?? s.start_date ?? '')) ?? null;
  const accommodation = stop ? accommodations.find((a) => a.stop_id === stop.id) ?? null : null;
  const todays = activities
    .filter((a) => a.day_id === day?.id)
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99') || a.order_index - b.order_index);
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const nextActivity = todays.find((a) => !a.time || a.time >= hhmm) ?? null;
  const dayIndex = day ? sortedDays.findIndex((d) => d.id === day.id) + 1 : 0;
  const span = Math.max(1, Math.round((atMidnight(end) - atMidnight(start)) / DAY_MS));
  const elapsed = Math.round((atMidnight(date) - atMidnight(start)) / DAY_MS);
  const progressPct = Math.min(100, Math.max(0, Math.round(((elapsed + 1) / (span + 1)) * 100)));

  return { ...base, phase: 'during', day, stop, accommodation, activities: todays, nextActivity, dayIndex, progressPct };
}
