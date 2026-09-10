import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { WikimediaService, WikiImage } from '../../core/wikimedia.service';

interface Section {
  city: string;
  jp: string;
  loading: boolean;
  images: WikiImage[];
}

@Component({
  selector: 'app-moodboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1>Moodboard <span class="jp-accent">インスピレーション</span></h1>
      <p class="subtitle">Images sourcées automatiquement depuis Wikimedia Commons.</p>
    </div>

    @for (section of sections(); track section.city) {
      <div class="mood-section">
        <div class="mood-section-header">
          <span class="mood-section-city">{{ section.city }}</span>
          @if (section.jp) { <span class="mood-section-jp">{{ section.jp }}</span> }
        </div>
        <div class="mood-images">
          @if (section.loading) {
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="mood-img-wrap"><div class="mood-img img-loading" style="height:100%"></div></div>
            }
          } @else {
            @for (img of section.images; track img.pageUrl) {
              <figure class="mood-img-wrap">
                <img class="mood-img" [src]="img.url" [alt]="img.title" loading="lazy" (click)="lightbox.set(img)">
                <a class="mood-img-source" [href]="img.pageUrl" target="_blank" rel="noopener" title="Source : Wikimedia Commons">Commons ↗</a>
                <figcaption class="mood-img-caption">{{ img.title }}</figcaption>
              </figure>
            } @empty {
              <p class="muted">Aucune image trouvée.</p>
            }
          }
        </div>
      </div>
    }

    @if (lightbox(); as img) {
      <div class="mood-lightbox" (click)="lightbox.set(null)">
        <button class="mood-lb-close" (click)="lightbox.set(null)">×</button>
        <img class="mood-lb-img" [src]="img.url" [alt]="img.title">
        <div class="mood-lb-caption">{{ img.title }} — <a [href]="img.pageUrl" target="_blank" rel="noopener">Wikimedia Commons ↗</a></div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .mood-img-source { position: absolute; top: 8px; right: 8px; z-index: 2; font-size: .58rem; font-weight: 700; letter-spacing: .04em; color: #fff; background: rgba(0, 0, 0, .5); padding: 3px 8px; border-radius: 999px; opacity: .85; }
    .mood-img-source:hover { opacity: 1; background: rgba(0, 0, 0, .7); color: #fff; }
    .mood-img { cursor: zoom-in; }
  `],
})
export class MoodboardPage {
  private readonly content = inject(ContentService);
  private readonly wiki = inject(WikimediaService);

  readonly sections = signal<Section[]>([]);
  readonly lightbox = signal<WikiImage | null>(null);

  constructor() {
    const seen = new Set<string>();
    const cities = this.content.stops()
      .filter((s) => !seen.has(s.city) && seen.add(s.city))
      .map((s) => ({ city: s.city, jp: this.content.destinationByCity(s.city)?.name_jp ?? '' }));

    this.sections.set(cities.map((c) => ({ ...c, loading: true, images: [] })));
    cities.forEach((c, index) => {
      void this.wiki.images(`${c.city} Japan`, 6).then((images) => {
        this.sections.update((list) => list.map((s, i) => (i === index ? { ...s, images, loading: false } : s)));
      });
    });
  }
}
