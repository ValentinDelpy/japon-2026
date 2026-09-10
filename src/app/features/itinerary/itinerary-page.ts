import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ExchangeService } from '../../core/exchange.service';
import { euro, formatRange, nightsLabel } from '../../core/format';

declare const L: any;

@Component({
  selector: 'app-itinerary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header"><h1>Itinéraire <span class="jp-accent">旅程</span></h1><p class="subtitle">Le parcours complet, étape par étape.</p></div>

    <div class="map-container mb-2"><div class="map-title-bar">🗾 Tracé complet</div><div id="iti-map"></div></div>

    <div class="converter-card mb-2">
      <div class="map-title-bar flex-between">💱 Convertisseur ¥ → €<span class="converter-rate-badge">1 € = {{ exchange.rate() ? exchange.rate()!.toFixed(2) : '—' }} ¥</span></div>
      <div class="converter-body"><div class="converter-row">
        <div class="converter-input-wrap"><label class="converter-label">Montant en yens (¥)</label>
          <div class="converter-input-group"><span class="conv-sym">¥</span><input class="converter-input" type="number" min="0" placeholder="ex : 1000" [value]="jpy() ?? ''" (input)="onJpy($event)"></div>
        </div>
        <div class="converter-arrow-col"><div class="conv-arrow">→</div></div>
        <div class="converter-result-wrap"><label class="converter-label">Montant en euros (€)</label>
          <div class="converter-output-group"><span class="conv-sym">€</span><span class="converter-output">{{ jpyEur() ?? '—' }}</span></div>
        </div>
      </div></div>
    </div>

    <div class="itinerary-summary-cards">
      @for (stop of stops(); track stop.id ?? stop.city) {
        <div class="summary-card">
          <h3>📍 {{ stop.city }} @if (dest(stop.city); as d) { <span class="jp-accent" style="opacity:.35;font-weight:400">{{ d.name_jp }}</span> }</h3>
          <ul class="summary-list">
            <li><span class="s-label">Dates</span><span class="s-value">{{ formatRange(stop.start_date, stop.end_date) }}</span></li>
            <li><span class="s-label">Nuits</span><span class="s-value">{{ nightsLabel(stop) }}</span></li>
            @if (accommodation(stop.id); as a) {
              @if (a.price_total) { <li><span class="s-label">Logement</span><span class="s-value">{{ euro(a.price_total) }}</span></li> }
              <li style="flex-direction:column;gap:3px"><span class="s-label">Hébergement</span><span class="text-sm">{{ a.name }}</span></li>
            }
            @if (activitiesFor(stop.id).length) {
              <li style="flex-direction:column;gap:4px"><span class="s-label">Activités</span><span class="text-sm muted">{{ activitiesFor(stop.id).join(' · ') }}</span></li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [':host { display: block; } #iti-map { height: 440px; width: 100%; }'],
})
export class ItineraryPage implements AfterViewInit, OnDestroy {
  readonly content = inject(ContentService);
  readonly exchange = inject(ExchangeService);
  readonly stops = this.content.stops;
  readonly formatRange = formatRange;
  readonly nightsLabel = nightsLabel;
  readonly euro = euro;

  readonly jpy = signal<number | null>(null);
  readonly jpyEur = computed(() => {
    const v = this.jpy();
    const r = this.exchange.rate();
    return v != null && r ? (v / r).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : null;
  });

  private map: any;

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 0); }
  ngOnDestroy(): void { this.map?.remove(); }

  onJpy(e: Event): void { const v = parseFloat((e.target as HTMLInputElement).value); this.jpy.set(Number.isFinite(v) ? v : null); }
  dest(city: string) { return this.content.destinationByCity(city); }
  accommodation(stopId?: string | null) { return this.content.accommodationForStop(stopId); }
  activitiesFor(stopId?: string | null): string[] {
    return this.content.content().activities.filter((a) => a.stop_id === stopId).map((a) => a.title);
  }

  private initMap(): void {
    const el = document.getElementById('iti-map');
    if (!el || typeof L === 'undefined') return;
    this.map = L.map(el, { scrollWheelZoom: true });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri · © OpenStreetMap', maxZoom: 16,
    }).addTo(this.map);

    const pts: [number, number][] = [];
    const seen = new Set<string>();
    this.stops().forEach((stop, idx) => {
      const d = this.dest(stop.city);
      if (!d?.lat || !d?.lng || seen.has(stop.city)) return;
      seen.add(stop.city);
      const coords: [number, number] = [d.lat, d.lng];
      L.marker(coords, {
        icon: L.divIcon({ className: 'custom-marker-wrapper', html: `<div class="custom-marker">${idx + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }),
      }).addTo(this.map).bindPopup(`<div class="popup-body"><div class="popup-title">${stop.city}</div><div class="popup-dates">${formatRange(stop.start_date, stop.end_date)}</div></div>`);
      L.marker(coords, {
        icon: L.divIcon({ className: 'marker-label-wrapper', html: `<div class="marker-label">${stop.city}</div>`, iconSize: [100, 20], iconAnchor: [-18, 10] }),
        interactive: false,
      }).addTo(this.map);
      pts.push(coords);
    });
    if (pts.length > 1) L.polyline(pts, { color: '#4f46e5', weight: 2.5, opacity: 0.6, dashArray: '8,8' }).addTo(this.map);
    if (pts.length) this.map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    else this.map.setView([36.2, 138.2], 6);
  }
}
