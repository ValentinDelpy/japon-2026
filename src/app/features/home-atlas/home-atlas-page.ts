import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { EditModeService } from '../../core/edit-mode.service';
import { buildHomeChapters, HomeChapter } from '../../core/home-data';
import { Activity } from '../../core/models';
import { euro } from '../../core/format';
import { loadLeaflet } from '../../core/leaflet';
import { InlineEdit } from '../../shared/inline-edit';

@Component({
  selector: 'app-home-atlas-page',
  imports: [FormsModule, RouterLink, InlineEdit],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atlas-wrap">
      <div id="atlas-map" class="atlas-map"></div>

      <div class="atlas-heading">
        <div class="eyebrow">Atlas du voyage</div>
        <h1>Le Japon,<br>d’un point à l’autre</h1>
        <p>{{ chapters().length }} bases · {{ nights() }} nuits · {{ trip()?.travelers }} personnes</p>
      </div>

      <aside class="atlas-panel">
        @if (selected(); as c) {
          <div class="atlas-kicker">Chapitre {{ indexOf(c) }} · {{ c.dates }}</div>
          <h2>{{ c.stop.city }}</h2>
          <div class="atlas-sub">{{ c.nights }} nuit{{ c.nights > 1 ? 's' : '' }} · base de logement</div>
          <div class="atlas-photo" [style.background-image]="c.photo ? 'url(' + c.photo + ')' : null"></div>
          @if (edit.active() && c.dest) {
            <input class="inline-input" [ngModel]="c.dest.image_url ?? ''" (ngModelChange)="stageDest(c, { image_url: $event })" placeholder="URL de la photo" aria-label="URL de la photo">
          }

          <div class="atlas-section">
            <div class="label">Logement</div>
            <div class="atlas-name">
              @if (c.acc) {
                <app-inline-edit [value]="c.acc.name" (valueChange)="stageAcc(c, { name: $event })">{{ c.acc.name }}</app-inline-edit>
              } @else { — }
            </div>
            <div class="atlas-meta">
              @if (c.acc?.price_total; as p) { {{ euro(p) }} · } {{ c.nights }} nuit{{ c.nights > 1 ? 's' : '' }}
            </div>
            @if (!edit.active()) {
              @if (c.acc?.url) { <a class="atlas-link" [href]="c.acc?.url ?? ''" target="_blank" rel="noopener">Ouvrir l’annonce ↗</a> }
              @if (c.acc?.alt_url) { <a class="atlas-link" [href]="c.acc?.alt_url ?? ''" target="_blank" rel="noopener">Alternative ↗</a> }
              @if (c.guide) { <a class="atlas-link" [href]="c.guide" target="_blank" rel="noopener">Guide de la ville ↗</a> }
            } @else {
              @if (c.acc) {
                <input class="inline-input" [ngModel]="c.acc.url ?? ''" (ngModelChange)="stageAcc(c, { url: $event })" placeholder="Lien du logement" aria-label="Lien du logement">
                <input class="inline-input" [ngModel]="c.acc.alt_url ?? ''" (ngModelChange)="stageAcc(c, { alt_url: $event })" placeholder="Lien de l’alternative" aria-label="Lien de l’alternative">
                <input class="inline-input" [ngModel]="c.acc.price_total ?? ''" (ngModelChange)="stagePrice(c, $event)" placeholder="Prix total (€)" aria-label="Prix total (€)">
              }
              @if (c.dest) { <input class="inline-input" [ngModel]="c.dest.guide_url ?? ''" (ngModelChange)="stageDest(c, { guide_url: $event })" placeholder="Guide de la ville (URL)" aria-label="Guide de la ville (URL)"> }
            }
          </div>

          @if (c.dest) {
            <div class="atlas-section">
              <div class="label">Présentation</div>
              <app-inline-edit [value]="c.dest.intro ?? ''" [multiline]="true" placeholder="Texte de présentation" (valueChange)="stageDest(c, { intro: $event })">{{ c.dest.intro }}</app-inline-edit>
            </div>
          }

          @if (c.activities.length) {
            <div class="atlas-section">
              <div class="label">Activités</div>
              <ul class="atlas-acts">
                @for (a of c.activities; track a.id) {
                  <li><app-inline-edit [value]="a.title" placeholder="Activité" (valueChange)="stageAct(a, { title: $event })">{{ a.title }}</app-inline-edit></li>
                }
              </ul>
            </div>
          }

          <a class="atlas-cta" routerLink="/itinerary">Jour par jour →</a>
        }
      </aside>

      <a class="atlas-today" routerLink="/today">Aujourd’hui →</a>

      <div class="atlas-strip">
        @for (c of chapters(); track c.stop.id ?? c.stop.city; let i = $index) {
          <button type="button" class="atlas-stop" [class.active]="selected()?.stop?.id === c.stop.id" (click)="select(c)">
            <span class="no">{{ (i + 1).toString().padStart(2, '0') }}</span>
            <span class="city">{{ c.stop.city }}</span>
            <span class="dates">{{ c.dates }}</span>
            <span class="nights">{{ c.nights }} nuit{{ c.nights > 1 ? 's' : '' }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class HomeAtlasPage implements AfterViewInit, OnDestroy {
  readonly content = inject(ContentService);
  readonly edit = inject(EditModeService);
  readonly euro = euro;
  readonly trip = this.content.trip;
  readonly chapters = computed(() => buildHomeChapters(this.content.content()));
  readonly nights = computed(() => this.chapters().reduce((n, c) => n + c.nights, 0));
  readonly selected = signal<HomeChapter | null>(null);

  private map: any;
  private destroyed = false;
  private readonly markers: { marker: any; chapter: HomeChapter }[] = [];

  ngAfterViewInit(): void { void this.init(); }
  ngOnDestroy(): void { this.destroyed = true; this.map?.remove(); }

  select(c: HomeChapter | null): void {
    if (!c) return;
    this.selected.set(c);
    for (const { marker, chapter } of this.markers) marker.getElement()?.classList.toggle('active', chapter === c);
    const lat = c.dest?.lat;
    const lng = c.dest?.lng;
    if (this.map && lat && lng) this.map.flyTo([lat, lng], Math.max(this.map.getZoom(), 6), { duration: 0.6 });
  }

  indexOf(c: HomeChapter): string { return String(this.chapters().indexOf(c) + 1).padStart(2, '0'); }
  stageDest(c: HomeChapter, patch: Record<string, unknown>): void { this.edit.stage('destinations', c.dest?.id, patch); }
  stageAcc(c: HomeChapter, patch: Record<string, unknown>): void { this.edit.stage('accommodations', c.acc?.id, patch); }
  stageAct(a: Activity, patch: Record<string, unknown>): void { this.edit.stage('activities', a.id, patch); }

  stagePrice(c: HomeChapter, value: string): void {
    const n = value.trim() === '' ? null : Number(value);
    this.stageAcc(c, { price_total: n !== null && Number.isFinite(n) ? n : null });
  }

  private async init(): Promise<void> {
    const L = await loadLeaflet();
    if (this.destroyed) return;
    const el = document.getElementById('atlas-map');
    if (!el) return;

    this.map = L.map(el, { scrollWheelZoom: true, zoomControl: false }).setView([36.4, 137.2], 5);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri · © OpenStreetMap', maxZoom: 16,
    }).addTo(this.map);

    const points: [number, number][] = [];
    this.chapters().forEach((c, i) => {
      const lat = c.dest?.lat;
      const lng = c.dest?.lng;
      if (!lat || !lng) return;
      const coords: [number, number] = [lat, lng];
      points.push(coords);
      const icon = L.divIcon({ className: 'atlas-marker', html: `<span>${i + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] });
      const marker = L.marker(coords, { icon }).addTo(this.map);
      marker.bindTooltip(c.stop.city, { permanent: true, direction: 'right', offset: [14, 0], className: 'atlas-label' });
      marker.on('click', () => this.select(c));
      this.markers.push({ marker, chapter: c });
    });

    if (points.length > 1) {
      L.polyline(points, { color: '#b2493a', weight: 1.8, opacity: 0.55, dashArray: '6,7' }).addTo(this.map);
    }
    this.select(this.chapters()[0] ?? null);
  }
}
