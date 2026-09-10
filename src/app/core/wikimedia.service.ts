import { Injectable } from '@angular/core';

export interface WikiImage {
  url: string;
  pageUrl: string;
  title: string;
}

/** Images depuis Wikimedia Commons (API CORS-friendly, gratuite, sourcée). */
@Injectable({ providedIn: 'root' })
export class WikimediaService {
  private readonly cache = new Map<string, Promise<WikiImage[]>>();

  images(query: string, limit = 8): Promise<WikiImage[]> {
    if (!query) return Promise.resolve([]);
    const key = `${query}|${limit}`;
    if (!this.cache.has(key)) this.cache.set(key, this.fetchImages(query, limit));
    return this.cache.get(key)!;
  }

  async gallery(query: string, limit = 6): Promise<string[]> {
    return (await this.images(query, limit)).map((i) => i.url);
  }

  private async fetchImages(query: string, limit: number): Promise<WikiImage[]> {
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
      `&gsrsearch=${encodeURIComponent('File:' + query)}&gsrnamespace=6&gsrlimit=${limit}` +
      '&prop=imageinfo&iiprop=url|mime&iiurlwidth=520&format=json&origin=*';
    try {
      const data = await (await fetch(url)).json();
      const pages: any[] = data?.query?.pages ? Object.values(data.query.pages) : [];
      return pages
        .filter((p) => p.imageinfo?.[0] && /jpeg|jpg|png|webp/i.test(p.imageinfo[0].mime || ''))
        .map((p) => ({
          url: p.imageinfo[0].thumburl || p.imageinfo[0].url,
          pageUrl: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(p.title),
          title: String(p.title || '').replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
        }))
        .filter((i) => !!i.url)
        .slice(0, limit);
    } catch {
      return [];
    }
  }
}
