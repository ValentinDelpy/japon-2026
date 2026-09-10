import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/content.service';
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
              </div>
            }
          </div>
        </article>
      } @empty {
        <div class="empty-state">Aucune fiche destination.</div>
      }
    </div>
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
  readonly destinations = this.content.destinations;
  readonly open = signal<string | null>(null);
  readonly formatRange = formatRange;
  readonly nightsLabel = nightsLabel;
  readonly euro = euro;

  constructor() {
    const city = this.route.snapshot.queryParamMap.get('city');
    if (!city) return;
    const d = this.content.destinationByCity(city);
    if (d) {
      this.open.set(d.slug);
      setTimeout(() => document.getElementById('sheet-' + d.slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  toggle(slug: string): void { this.open.set(this.open() === slug ? null : slug); }

  stopFor(d: Destination) {
    const n = d.name.toLowerCase();
    return this.content.stops().find((s) => s.city.toLowerCase().includes(n.split(' ')[0]) || n.includes(s.city.toLowerCase()));
  }
}
