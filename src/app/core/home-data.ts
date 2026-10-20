import { Accommodation, Activity, Content, Destination, Stop } from './models';
import { formatRange } from './format';

export interface HomeExcursion { name: string; photo: string; guide: string | null; }

export interface HomeChapter {
  stop: Stop;
  dest?: Destination;
  acc?: Accommodation;
  photo: string | null;
  dates: string;
  nights: number;
  firstDayId: string | null;
  visited: string[];
  activities: Activity[];
  excursion: HomeExcursion | null;
  guide: string | null;
}

/** Construit les chapitres d'accueil (Carnet et Atlas) à partir du contenu. */
export function buildHomeChapters(content: Content): HomeChapter[] {
  const days = [...content.days].sort((a, b) => a.date.localeCompare(b.date));
  const activities = content.activities;
  const accommodations = content.accommodations;

  const findDest = (city?: string | null): Destination | undefined => {
    if (!city) return undefined;
    const n = normalize(city);
    return content.destinations.find((d) => n.includes(normalize(d.slug)) || normalize(d.name).includes(n) || n.includes(normalize(d.name)));
  };

  return [...content.stops].sort((a, b) => a.order_index - b.order_index).map((stop) => {
    const dest = findDest(stop.city);
    const acc = accommodations.find((a) => a.stop_id === stop.id);
    const stopDays = days.filter((d) => (d.base_stop_id ?? d.stop_id) === stop.id);
    const visited = [...new Set(stopDays.map((d) => d.visited_place).filter((v): v is string => !!v))];
    const acts = activities.filter((a) => stopDays.some((d) => d.id === a.day_id));

    let excursion: HomeExcursion | null = null;
    for (const name of visited) {
      const d = findDest(name);
      if (d?.image_url && d.slug !== dest?.slug) {
        excursion = { name: d.name, photo: d.image_url, guide: d.guide_url ?? null };
        break;
      }
    }

    return {
      stop,
      dest,
      acc,
      photo: dest?.image_url ?? null,
      dates: formatRange(stop.start_date, stop.end_date),
      nights: stop.nights ?? 0,
      firstDayId: stopDays[0]?.id ?? null,
      visited,
      activities: acts,
      excursion,
      guide: dest?.guide_url ?? null,
    };
  });
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}
