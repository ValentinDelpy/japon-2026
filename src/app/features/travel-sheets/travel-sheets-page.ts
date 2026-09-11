import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { WikimediaService, WikiSummary } from '../../core/wikimedia.service';
import { Destination } from '../../core/models';
import { euro, formatRange, nightsLabel } from '../../core/format';

@Component({
  selector: 'app-travel-sheets-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Fiches Voyage <span class="jp-accent">旅のガイド</span></h1><p class="subtitle">Guides détaillés par destination.</p></div>

    <div class="guides-dest-list">
      @for (d of destinations(); track d.slug; let i = $index) {
        <article class="guide-dest-card" [id]="'sheet-' + d.slug" [class.expanded]="open() === d.slug" (click)="toggle(d.slug)">
          <div class="guide-dest-thumb" [style.background-image]="d.image_url ? 'url(' + d.image_url + ')' : null">
            <div class="guide-dest-num">{{ i + 1 }}</div>
          </div>
          <div class="guide-dest-info">
            <div class="guide-dest-header">
              <div>
                <div class="guide-dest-city">{{ d.name }} <span class="guide-dest-jp">{{ d.name_jp }}</span></div>
                @if (stopFor(d); as s) { <div class="guide-dest-dates">{{ formatRange(s.start_date, s.end_date) }} · {{ nightsLabel(s) }}</div> }
              </div>
            </div>
            <div class="guide-dest-tags">
              @if (d.highlights.length) { <span class="dest-tag dest-tag-act">📍 {{ d.highlights.length }} à voir</span> }
              @if (d.restaurants.length) { <span class="dest-tag dest-tag-price">🍜 {{ d.restaurants.length }} restos</span> }
            </div>
            @if (d.intro) { <div class="guide-dest-preview">{{ d.intro }}</div> }

            @if (open() === d.slug) {
              <div class="sheet-detail" (click)="$event.stopPropagation()">
                @if (summaries()[d.slug]; as s) {
                  <div class="gd-section"><div class="gd-section-title">PRÉSENTATION · WIKIPÉDIA</div><p class="gd-intro">{{ s.extract }}</p><a class="cell-link text-sm" [href]="s.pageUrl" target="_blank" rel="noopener">Lire sur Wikipédia ↗</a></div>
                } @else if (summaries()[d.slug] === null) {
                  <div class="gd-section"><div class="gd-section-title">PRÉSENTATION</div><p class="gd-intro muted">Aucun résumé Wikipédia trouvé.</p></div>
                }
                @if (d.highlights.length) {
                  <div class="gd-section"><div class="gd-section-title">À NE PAS MANQUER</div><ul class="gd-highlights">
                    @for (h of d.highlights; track h) { <li>{{ h }}</li> }
                  </ul></div>
                }
                @if (d.restaurants.length) {
                  <div class="gd-section"><div class="gd-section-title">OÙ MANGER</div><div class="gd-restos">
                    @for (r of d.restaurants; track r.name) {
                      <div class="gd-resto"><div class="gd-resto-name">{{ r.name }}</div><div class="gd-resto-type">{{ r.type }}</div><div class="gd-resto-desc">{{ r.description }}</div><div class="gd-resto-price">💴 {{ r.price }}</div></div>
                    }
                  </div></div>
                }
                @if (d.funFacts.length) {
                  <div class="gd-section"><div class="gd-section-title">LE SAVIEZ-VOUS ?</div><ul class="gd-highlights gd-funfacts">
                    @for (f of d.funFacts; track f) { <li>{{ f }}</li> }
                  </ul></div>
                }
                @if (d.tips) { <div class="gd-section"><div class="gd-section-title">CONSEILS</div><div class="gd-tips">{{ d.tips }}</div></div> }
                @if (galleries()[d.slug]?.length) {
                  <div class="gd-section"><div class="gd-section-title">PHOTOS</div>
                    <div class="gd-gallery">
                      @for (img of galleries()[d.slug]; track img) {
                        <div class="gd-gallery-img" [style.background-image]="'url(' + img + ')'" (click)="lightbox.set(img)"></div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </article>
      } @empty {
        <div class="empty-state">Aucune fiche destination.</div>
      }
    </div>

    @if (lightbox(); as url) {
      <div class="gd-lightbox" (click)="lightbox.set(null)">
        <button class="gd-lightbox-close" (click)="lightbox.set(null)">×</button>
            <img [src]="url" alt="" loading="lazy" decoding="async">
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .guide-dest-card { cursor: pointer; }
    .guide-dest-card.expanded { border-color: var(--accent); }
    .sheet-detail { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
    .sheet-detail .gd-section { margin-bottom: 14px; }
  `],
})
export class TravelSheetsPage {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly wiki = inject(WikimediaService);
  readonly destinations = this.content.destinations;
  readonly open = signal<string | null>(null);
  readonly galleries = signal<Record<string, string[]>>({});
  readonly summaries = signal<Record<string, WikiSummary | null>>({});
  readonly lightbox = signal<string | null>(null);
  readonly formatRange = formatRange;
  readonly nightsLabel = nightsLabel;
  readonly euro = euro;

  constructor() {
    const city = this.route.snapshot.queryParamMap.get('city');
    if (!city) return;
    const d = this.content.destinationByCity(city);
    if (d) {
      this.open.set(d.slug);
      this.loadGallery(d);
      this.loadSummary(d);
      setTimeout(() => document.getElementById('sheet-' + d.slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  toggle(slug: string): void {
    const next = this.open() === slug ? null : slug;
    this.open.set(next);
    if (next) {
      const d = this.destinations().find((x) => x.slug === next);
      if (d) { this.loadGallery(d); this.loadSummary(d); }
    }
  }

  private loadGallery(d: Destination): void {
    if (this.galleries()[d.slug]) return;
    void this.wiki.gallery(`${d.name} Japan`).then((imgs) => this.galleries.set({ ...this.galleries(), [d.slug]: imgs }));
  }

  private loadSummary(d: Destination): void {
    if (this.summaries()[d.slug] !== undefined) return;
    void this.wiki.summary(d.name).then((s) => this.summaries.set({ ...this.summaries(), [d.slug]: s }));
  }

  stopFor(d: Destination) {
    const n = d.name.toLowerCase();
    return this.content.stops().find((s) => s.city.toLowerCase().includes(n.split(' ')[0]) || n.includes(s.city.toLowerCase()));
  }
}
