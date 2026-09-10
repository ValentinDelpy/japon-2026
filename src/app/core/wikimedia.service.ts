import { Injectable } from '@angular/core';

/** Galerie photo depuis Wikimedia Commons (API CORS-friendly, gratuite). */
@Injectable({ providedIn: 'root' })
export class WikimediaService {
  private readonly cache = new Map<string, Promise<string[]>>();

  gallery(query: string, limit = 6): Promise<string[]> {
    if (!query) return Promise.resolve([]);
    if (!this.cache.has(query)) this.cache.set(query, this.fetchImages(query, limit));
    return this.cache.get(query)!;
  }

  private async fetchImages(query: string, limit: number): Promise<string[]> {
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
      `&gsrsearch=${encodeURIComponent('File:' + query)}&gsrnamespace=6&gsrlimit=${limit}` +
      '&prop=imageinfo&iiprop=url|mime&iiurlwidth=480&format=json&origin=*';
    try {
      const data = await (await fetch(url)).json();
      const pages: any[] = data?.query?.pages ? Object.values(data.query.pages) : [];
      return pages
        .filter((p) => p.imageinfo?.[0] && /jpeg|jpg|png|webp/i.test(p.imageinfo[0].mime || ''))
        .map((p) => p.imageinfo[0].thumburl || p.imageinfo[0].url)
        .filter((u): u is string => !!u)
        .slice(0, limit);
    } catch {
      return [];
    }
  }
}
