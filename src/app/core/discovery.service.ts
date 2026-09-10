import { Injectable } from '@angular/core';

export type PlaceKind = 'must' | 'insolite' | 'resto';

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  category: string;
  lat: number;
  lng: number;
  osmUrl: string;
  website?: string;
  wikipedia?: string;
  cuisine?: string;
}

const MUST_TOURISM = ['attraction', 'museum', 'garden', 'theme_park', 'zoo'];
const INSOLITE_TOURISM = ['artwork', 'viewpoint', 'gallery', 'aquarium', 'yes'];
const MUST_HISTORIC = ['castle', 'monument', 'memorial', 'city_gate'];
const INSOLITE_HISTORIC = ['ruins', 'archaeological_site', 'tower'];

/** Lieux à découvrir via OpenStreetMap (Overpass API — gratuit, sans clé, CORS). */
@Injectable({ providedIn: 'root' })
export class DiscoveryService {
  private readonly cache = new Map<string, Promise<Place[]>>();

  places(lat: number, lng: number, radiusKm = 4): Promise<Place[]> {
    if (!lat || !lng) return Promise.resolve([]);
    const d = radiusKm / 111;
    const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusKm}`;
    if (!this.cache.has(key)) this.cache.set(key, this.fetchPlaces(lat, lng, d));
    return this.cache.get(key)!;
  }

  private async fetchPlaces(lat: number, lng: number, d: number): Promise<Place[]> {
    const bbox = `${(lat - d).toFixed(4)},${(lng - d).toFixed(4)},${(lat + d).toFixed(4)},${(lng + d).toFixed(4)}`;
    const query = `[out:json][timeout:25];
(
  nwr["tourism"~"^(attraction|museum|garden|theme_park|zoo|artwork|viewpoint|gallery|aquarium)$"](bbox);
  nwr["historic"~"^(castle|monument|memorial|city_gate|ruins|archaeological_site|tower)$"](bbox);
  nwr["amenity"~"^(place_of_worship|theatre)$"]["name"](bbox);
  nwr["amenity"="restaurant"]["name"](bbox);
);
out center 250;`.replaceAll('bbox', bbox);

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const places: Place[] = [];
      const seen = new Set<string>();
      for (const e of data.elements ?? []) {
        const t = e.tags ?? {};
        const name = t['name:en'] || t.name;
        if (!name || seen.has(name)) continue;
        const c = e.center ?? e;
        if (c.lat == null || c.lon == null) continue;
        seen.add(name);
        const place = this.toPlace(e, t, name, c.lat, c.lon);
        if (place) places.push(place);
      }
      const rank = (p: Place) => (p.wikipedia ? 2 : 0) + (p.website ? 1 : 0);
      return [
        ...places.filter((p) => p.kind === 'must').sort((a, b) => rank(b) - rank(a)).slice(0, 10),
        ...places.filter((p) => p.kind === 'insolite').sort((a, b) => rank(b) - rank(a)).slice(0, 8),
        ...places.filter((p) => p.kind === 'resto').sort((a, b) => rank(b) - rank(a)).slice(0, 14),
      ];
    } catch {
      return [];
    }
  }

  private toPlace(e: any, t: any, name: string, lat: number, lng: number): Place | null {
    const base = { id: `${e.type}/${e.id}`, name, lat, lng, osmUrl: `https://www.openstreetmap.org/${e.type}/${e.id}` };
    const wikipedia = t.wikipedia ? `https://${String(t.wikipedia).replace(' ', '')}` : undefined;
    const website = t.website || t['contact:website'] || undefined;

    if (t.amenity === 'restaurant') {
      return { ...base, kind: 'resto', category: t.cuisine ? String(t.cuisine).split(';')[0] : 'Restaurant', cuisine: t.cuisine, website, wikipedia };
    }
    if (t.amenity === 'place_of_worship') {
      const cat = t.religion === 'shinto' ? 'Sanctuaire' : t.religion === 'buddhist' ? 'Temple' : 'Lieu de culte';
      return { ...base, kind: 'must', category: cat, website, wikipedia };
    }
    if (t.amenity === 'theatre') return { ...base, kind: 'insolite', category: 'Théâtre', website, wikipedia };
    if (t.historic) {
      const kind = INSOLITE_HISTORIC.includes(t.historic) ? 'insolite' : 'must';
      return { ...base, kind, category: capitalize(String(t.historic).replace(/_/g, ' ')), website, wikipedia };
    }
    if (t.tourism) {
      const kind = INSOLITE_TOURISM.includes(t.tourism) && !MUST_TOURISM.includes(t.tourism) ? 'insolite' : 'must';
      return { ...base, kind, category: capitalize(String(t.tourism).replace(/_/g, ' ')), website, wikipedia };
    }
    return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
