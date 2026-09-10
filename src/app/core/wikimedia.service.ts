import { Injectable } from '@angular/core';

export interface WikiImage {
  url: string;
  pageUrl: string;
  title: string;
}

export interface WikiSummary {
  extract: string;
  pageUrl: string;
  thumbnail?: string;
}

/** Images et résumés depuis Wikimedia (API CORS-friendly, gratuites, sourcées). */
@Injectable({ providedIn: 'root' })
export class WikimediaService {
  private readonly cache = new Map<string, Promise<WikiImage[]>>();
  private readonly summaryCache = new Map<string, Promise<WikiSummary | null>>();

  images(query: string, limit = 8): Promise<WikiImage[]> {
    if (!query) return Promise.resolve([]);
    const key = `${query}|${limit}`;
    if (!this.cache.has(key)) this.cache.set(key, this.fetchImages(query, limit));
    return this.cache.get(key)!;
  }

  async gallery(query: string, limit = 6): Promise<string[]> {
    return (await this.images(query, limit)).map((i) => i.url);
  }

  /** Résumé Wikipédia (présentation auto-générée d'une destination). */
  summary(title: string): Promise<WikiSummary | null> {
    if (!title) return Promise.resolve(null);
    if (!this.summaryCache.has(title)) this.summaryCache.set(title, this.fetchSummary(title));
    return this.summaryCache.get(title)!;
  }

  private async fetchSummary(title: string): Promise<WikiSummary | null> {
    try {
      const res = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`);
      if (!res.ok) return null;
      const d = await res.json();
      const extract = String(d.extract ?? '').trim();
      if (!extract) return null;
      return {
        extract,
        pageUrl: d.content_urls?.desktop?.page ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        thumbnail: d.thumbnail?.source,
      };
    } catch {
      return null;
    }
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
