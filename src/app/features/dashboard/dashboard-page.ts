import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { euro, formatRange, nightsLabel } from '../../core/format';

declare const L: any;

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (trip(); as t) {
      <!-- Hero -->
      <div class="dash-hero" [style.background-image]="heroImage()">
        <div class="dash-hero-overlay"></div>
        <div class="dash-hero-content">
          <div class="dash-hero-main">
            <span class="dash-hero-eyebrow">{{ t.subtitle }}</span>
            <h1>{{ t.origin }} <span class="dash-hero-arrow">→</span> {{ t.destination }}</h1>
            <p class="dash-hero-dates">{{ formatRange(t.start_date, t.end_date) }} · {{ stops().length }} étapes · {{ t.travelers }} personnes</p>
          </div>
          <div class="dash-hero-side">
            <div class="dash-hero-count">{{ countdownText() }}</div>
            <div class="dash-hero-count-label">{{ countdownLabel() }}</div>
          </div>
        </div>
      </div>

      <!-- Statut -->
      <div class="trip-status-banner" [class]="statusClass()">
        <span class="tsb-icon">{{ statusIcon() }}</span>
        <div class="tsb-text"><strong>{{ statusTitle() }}</strong>{{ statusDetail() }}</div>
      </div>

      <!-- Progression -->
      <div class="progress-strip">
        <div class="prog-item">
          <div class="prog-header"><span class="prog-label">Logements réservés</span><span class="prog-value" style="color:var(--sage)">{{ reservedCount() }}/{{ stops().length }}</span></div>
          <div class="prog-track"><div class="prog-fill prog-fill-sage" [style.width.%]="pct(reservedCount(), stops().length)"></div></div>
        </div>
        <div class="prog-item">
          <div class="prog-header"><span class="prog-label">Réservations</span><span class="prog-value" style="color:var(--sky)">{{ bookedReservations() }}/{{ reservations().length }}</span></div>
          <div class="prog-track"><div class="prog-fill prog-fill-sky" [style.width.%]="pct(bookedReservations(), reservations().length)"></div></div>
        </div>
        <div class="prog-item">
          <div class="prog-header"><span class="prog-label">Activités planifiées</span><span class="prog-value" style="color:var(--accent)">{{ activities().length }}</span></div>
          <div class="prog-track"><div class="prog-fill prog-fill-blush" [style.width.%]="activityProgress()"></div></div>
        </div>
        <div class="prog-item">
          <div class="prog-header"><span class="prog-label">Budget total</span><span class="prog-value" style="color:var(--amber)">{{ euro(grand()) }}</span></div>
          <div class="prog-track"><div class="prog-fill prog-fill-amber" style="width:75%"></div></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Étapes</div><div class="stat-value indigo">{{ stops().length }}</div><div class="stat-detail">{{ days().length }} journées</div></div>
        <div class="stat-card"><div class="stat-label">Hébergement</div><div class="stat-value vermillion">{{ euro(lodgingTotal()) }}</div><div class="stat-detail">{{ euro(lodgingTotal() / (t.travelers || 1)) }}/pers.</div></div>
        <div class="stat-card"><div class="stat-label">Transport</div><div class="stat-value gold">{{ euro(transportTotal()) }}</div><div class="stat-detail">{{ transportLegs().length }} trajets</div></div>
        <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value bamboo">{{ euro(grand()) }}</div><div class="stat-detail">{{ euro(grand() / (t.travelers || 1)) }}/pers.</div></div>
        <div class="stat-card"><div class="stat-label">Restaurants</div><div class="stat-value teal">{{ restaurants().length }}</div><div class="stat-detail">{{ destinations().length }} destinations</div></div>
      </div>

      <!-- Carte + étapes -->
      <div class="dashboard-grid dash-split">
        <div class="map-container"><div class="map-title-bar">🗾 Carte de l'itinéraire</div><div id="dash-map"></div></div>
        <div class="stops-panel">
          <div class="stops-panel-header"><span class="stops-panel-title">Étapes <span class="stops-count">{{ stops().length }}</span></span><span class="stops-panel-hint">cliquer pour détailler</span></div>
          <div class="stops-list">
            @for (stop of stops(); track stop.id ?? stop.city; let i = $index) {
              <div class="stop-card" [class.expanded]="openStop() === (stop.id ?? stop.city)" [class.trip-current]="isCurrent(stop)">
                <div class="card-strip" [style.background]="color(i)"></div>
                <div class="card-head-row" (click)="toggleStop(stop)">
                  <div class="card-num-badge" [style.background]="color(i)">{{ i + 1 }}</div>
                  <div class="card-num-city">
                    <a class="card-city card-city-link" [routerLink]="['/sheets']" [queryParams]="{ city: stop.city }" (click)="$event.stopPropagation()" title="Voir la fiche">{{ stop.city }}</a>
                    <div class="card-dates">{{ formatRange(stop.start_date, stop.end_date) }} · {{ nightsLabel(stop) }}</div>
                  </div>
                  <div class="card-right">
                    @if (accommodation(stop.id)?.price_total) { <div class="card-price">{{ euro(accommodation(stop.id)!.price_total) }}</div> }
                    <div class="card-expand-btn"><span class="arrow">▾</span></div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="card-body-inner">
                    @if (destination(stop.city)?.image_url) {
                      <div class="card-hero-expanded" [style.background-image]="'url(' + destination(stop.city)!.image_url + ')'">
                        <div class="card-hero-exp-overlay"></div>
                        <a class="card-hero-exp-city" [routerLink]="['/sheets']" [queryParams]="{ city: stop.city }" (click)="$event.stopPropagation()">{{ stop.city }} @if (destination(stop.city)?.name_jp) { <span class="card-hero-jp">{{ destination(stop.city)!.name_jp }}</span> } <span class="card-hero-cta">Fiche →</span></a>
                      </div>
                    }
                    @if (accommodation(stop.id); as a) {
                      <div class="lodge-section">
                        <div class="lodge-title">Hébergement</div>
                        <div class="lodge-options">
                          @if (a.url) {
                            <a class="lodge-option main-opt" [href]="a.url" target="_blank" rel="noopener"><span class="lodge-badge">Choix 1</span><span class="lodge-name">{{ a.name }}</span><span class="lodge-arrow">→</span></a>
                          } @else {
                            <div class="lodge-option main-opt no-link"><span class="lodge-badge">Choix 1</span><span class="lodge-name">{{ a.name }}</span></div>
                          }
                          @if (a.alt_name) {
                            @if (a.alt_url) {
                              <a class="lodge-option alt-opt" [href]="a.alt_url" target="_blank" rel="noopener"><span class="lodge-badge badge-alt">Alt.</span><span class="lodge-name">{{ a.alt_name }}</span><span class="lodge-arrow">→</span></a>
                            } @else {
                              <div class="lodge-option alt-opt no-link"><span class="lodge-badge badge-alt">Alt.</span><span class="lodge-name">{{ a.alt_name }}</span></div>
                            }
                          }
                        </div>
                        @if (a.reserved) { <div class="gd-reserve">✅ Réservé</div> }
                      </div>
                    }
                    @if (transportFor(stop.id); as tr) {
                      <div class="detail-row"><div class="detail-icon" style="background:var(--sky-l)">🚄</div>
                        <div class="detail-content"><div class="detail-label">Trajet</div><div class="detail-value">{{ tr.duration || tr.mode }}{{ tr.price ? ' · ' + euro(tr.price) : '' }}</div></div></div>
                    }
                    @if (activitiesForStop(stop.id).length) {
                      <div class="act-section"><div class="lodge-title">Activités</div><div class="activity-pills">@for (a of activitiesForStop(stop.id); track a) { <span class="activity-pill">{{ a }}</span> }</div></div>
                    }
                    @if (weatherPills(stop).length) {
                      <div class="weather-mini-section">
                        <div class="lodge-title">Météo (historique)</div>
                        <div class="wx-day-row">
                          @for (w of weatherPills(stop); track w.date) {
                            <div class="wx-day-pill"><div class="wx-dp-date">{{ w.label }}</div><div class="wx-dp-icon">{{ w.icon }}</div><div class="wx-dp-high">{{ w.high }}°</div><div class="wx-dp-low">{{ w.low }}°</div><div class="wx-dp-rain">💧{{ w.rain }}%</div></div>
                          }
                        </div>
                        @if (weatherForCity(stop.city)?.description; as desc) { <div class="wx-desc">{{ desc }}</div> }
                      </div>
                    }
                    @if (stop.notes) {
                      <div class="detail-row"><div class="detail-icon" style="background:var(--amber-l)">✦</div><div class="detail-content"><div class="detail-label">Note</div><div class="detail-value" style="font-style:italic">{{ stop.notes }}</div></div></div>
                    }
                    <div class="note-block">
                      <div class="lodge-title">Note personnelle</div>
                      @if (editingNote() === stop.city) {
                        <textarea class="note-editor-ta" [value]="noteDraft()" (input)="onNoteInput($event)" placeholder="Votre note pour {{ stop.city }}…"></textarea>
                        <div class="note-editor-actions">
                          <button class="note-btn note-save" (click)="saveNote(stop.city)">Enregistrer</button>
                          <button class="note-btn note-cancel" (click)="editingNote.set(null)">Annuler</button>
                        </div>
                      } @else {
                        @if (noteFor(stop.city)) { <p class="note-display">{{ noteFor(stop.city) }}</p> }
                        <button class="note-edit-btn" (click)="startNote(stop.city)">📝 {{ noteFor(stop.city) ? 'Modifier la note' : 'Ajouter une note' }}</button>
                      }
                    </div>
                    <div class="card-cta-row">
                      <a class="btn btn-secondary btn-sm" [routerLink]="['/sheets']" [queryParams]="{ city: stop.city }" (click)="$event.stopPropagation()">📖 Voir la fiche complète →</a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Prochains jours + répartition budget -->
      <div class="dashboard-grid dash-split">
        <section class="home-panel">
          <div class="map-title-bar flex-between"><span>📅 Prochains jours</span><a routerLink="/timeline" class="text-sm">Timeline →</a></div>
          <div class="upcoming-list">
            @for (day of upcomingDays(); track day.date) {
              <div class="upcoming-row">
                <div class="upcoming-date">{{ day.short }}</div>
                <div class="upcoming-body">
                  <div class="upcoming-city">{{ day.city || '—' }}</div>
                  @if (day.activities.length) { <div class="upcoming-acts">{{ day.activities.join(' · ') }}</div> }
                </div>
              </div>
            } @empty { <p class="muted" style="padding:16px">Aucune journée à venir.</p> }
          </div>
        </section>

        <section class="budget-summary home-panel">
          <h3>Répartition par ville</h3>
          @for (bar of budgetBars(); track bar.city) {
            <div class="budget-bar-item">
              <div class="budget-bar-label"><span class="cat">{{ bar.city }}</span><span class="val">{{ bar.pct }}% · {{ euro(bar.value) }}</span></div>
              <div class="budget-bar"><div class="budget-bar-fill" [style.width.%]="bar.pct" [style.background]="bar.color"></div></div>
            </div>
          } @empty { <p class="muted">Aucune donnée budget.</p> }
        </section>
      </div>

      <!-- Détail budget -->
      <div class="budget-table-wrap mb-2">
        <div class="map-title-bar flex-between"><span>💰 Détail du budget</span><span class="text-sm muted">{{ euro(grand()) }}</span></div>
        <div class="table-scroll">
          <table class="budget-table">
            <thead><tr><th>#</th><th>Dates</th><th>Lieu</th><th>Hébergement</th><th>Transport</th><th>Réservé</th></tr></thead>
            <tbody>
              @for (stop of stops(); track stop.id ?? stop.city; let i = $index) {
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td class="text-sm">{{ formatRange(stop.start_date, stop.end_date) }}</td>
                  <td>{{ stop.city }}</td>
                  <td class="amount">{{ accommodation(stop.id)?.price_total ? euro(accommodation(stop.id)!.price_total) : '—' }}</td>
                  <td class="amount">{{ transportFor(stop.id) ? euro(transportFor(stop.id)!.price) : '—' }}</td>
                  <td class="text-sm">{{ accommodation(stop.id)?.reserved ? '✅' : '⏳' }}</td>
                </tr>
              }
              <tr style="font-weight:700;background:var(--surface2)"><td colspan="3">TOTAL</td><td class="amount">{{ euro(lodgingTotal()) }}</td><td class="amount">{{ euro(transportTotal()) }}</td><td></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Accès rapides -->
      <div class="quick-links">
        @for (link of quickLinks; track link.path) {
          <a class="quick-link" [routerLink]="link.path"><span class="quick-link-icon">{{ link.icon }}</span><span>{{ link.label }}</span></a>
        }
      </div>
    } @else {
      <div class="empty-state"><div style="font-size:2.5rem">🗾</div><h3>Aucun voyage configuré</h3><p>Ajoutez un voyage depuis l'administration.</p><a class="btn btn-primary" routerLink="/admin/trip">Administration</a></div>
    }
  `,
  styles: [`
    :host { display: block; }
    #dash-map { height: 440px; width: 100%; }
    .home-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
    .budget-summary { padding: 18px; }
    .budget-summary h3 { margin-bottom: 14px; font-size: .92rem; }
    .upcoming-list { display: flex; flex-direction: column; }
    .upcoming-row { display: flex; gap: 14px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .upcoming-row:last-child { border-bottom: none; }
    .upcoming-date { font-family: 'Space Mono', monospace; font-size: .8rem; font-weight: 700; color: var(--accent); flex-shrink: 0; }
    .upcoming-city { font-weight: 600; }
    .upcoming-acts { font-size: .76rem; color: var(--ink3); margin-top: 2px; }
    .quick-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 24px; }
    .quick-link { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); color: var(--ink); font-weight: 600; font-size: .85rem; transition: border-color .2s, transform .2s; }
    .quick-link:hover { border-color: var(--accent); transform: translateY(-2px); }
    .quick-link-icon { font-size: 1.25rem; }
    .card-cta-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  `],
})
export class DashboardPage implements AfterViewInit, OnDestroy {
  private readonly content = inject(ContentService);

  readonly trip = this.content.trip;
  readonly stops = this.content.stops;
  readonly days = this.content.days;
  readonly activities = this.content.activities;
  readonly destinations = this.content.destinations;
  readonly restaurants = this.content.restaurants;
  readonly transportLegs = computed(() => this.content.content().transportLegs);
  readonly reservations = computed(() => this.content.content().reservations);
  readonly formatRange = formatRange;
  readonly nightsLabel = nightsLabel;
  readonly euro = euro;

  private static readonly COLORS = ['#b23a2e', '#2b4a63', '#5f7a5a', '#a9822f', '#6d5a7a', '#8d2a20'];
  readonly quickLinks = [
    { path: '/itinerary', icon: '🗺️', label: 'Itinéraire' },
    { path: '/timeline', icon: '📅', label: 'Timeline' },
    { path: '/sheets', icon: '📖', label: 'Fiches' },
    { path: '/restaurants', icon: '🍜', label: 'Restos' },
    { path: '/packing', icon: '🎒', label: 'Packing' },
    { path: '/checklist', icon: '✅', label: 'Check-list' },
    { path: '/logistics', icon: '🚉', label: 'Logistique' },
    { path: '/phrasebook', icon: '🗣️', label: 'Phrasebook' },
  ];

  private map: any;

  readonly lodgingTotal = computed(() => this.content.content().accommodations.reduce((s, a) => s + (a.price_total ?? 0), 0));
  readonly transportTotal = computed(() => this.transportLegs().reduce((s, l) => s + (l.price ?? 0), 0));
  readonly grand = computed(() => this.lodgingTotal() + this.transportTotal());
  readonly reservedCount = computed(() => this.stops().filter((s) => this.accommodation(stopId(s))?.reserved).length);
  readonly bookedReservations = computed(() => this.reservations().filter((r) => r.status === 'booked').length);

  readonly activityProgress = computed(() => {
    const d = this.days().length || 1;
    return Math.min(100, Math.round((this.activities().length / (d * 2)) * 100));
  });

  readonly countdownText = computed(() => {
    const start = this.trip()?.start_date;
    if (!start) return '—';
    const d = this.daysLeft();
    return d > 0 ? String(d) : d === 0 ? '✈️' : '🎌';
  });
  readonly countdownLabel = computed(() => (this.daysLeft() > 0 ? 'jours avant le départ' : 'Bon voyage !'));

  private daysLeft(): number {
    const start = this.trip()?.start_date;
    if (!start) return 0;
    return Math.ceil((new Date(start + 'T00:00:00').getTime() - Date.now()) / 86400000);
  }

  readonly statusClass = computed(() => {
    const start = this.trip()?.start_date;
    const end = this.trip()?.end_date;
    const today = new Date().toISOString().slice(0, 10);
    if (!start) return 'tsb-before';
    if (today < start) return 'tsb-before';
    if (today > (end ?? start)) return 'tsb-after';
    return 'tsb-during';
  });
  readonly statusIcon = computed(() => (this.statusClass() === 'tsb-during' ? '📍' : this.statusClass() === 'tsb-after' ? '🎌' : '✈️'));
  readonly statusTitle = computed(() => {
    const c = this.statusClass();
    if (c === 'tsb-during') return 'Voyage en cours';
    if (c === 'tsb-after') return 'Voyage terminé';
    return 'Voyage à venir';
  });
  readonly statusDetail = computed(() => {
    const c = this.statusClass();
    if (c === 'tsb-during') {
      const today = new Date().toISOString().slice(0, 10);
      const current = this.stops().find((s) => (s.start_date ?? '') <= today && today <= (s.end_date ?? s.start_date ?? ''));
      return current ? ` · Actuellement à ${current.city}` : '';
    }
    if (c === 'tsb-after') return ' · Retour de Tokyo';
    return ` · Départ dans ${this.daysLeft()} jours`;
  });

  readonly upcomingDays = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const acts = this.activities();
    const stopById = new Map(this.stops().map((s) => [s.id, s]));
    return this.days()
      .filter((d) => d.date >= today)
      .slice(0, 7)
      .map((d) => ({
        date: d.date,
        short: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
        city: stopById.get(d.stop_id ?? '')?.city ?? '',
        activities: acts.filter((a) => a.day_id === d.id).map((a) => a.title),
      }));
  });

  readonly budgetBars = computed(() => {
    const by = new Map<string, number>();
    for (const a of this.content.content().accommodations) {
      const stop = this.stops().find((s) => s.id === a.stop_id);
      if (stop) by.set(stop.city, (by.get(stop.city) ?? 0) + (a.price_total ?? 0));
    }
    const max = Math.max(1, ...[...by.values()]);
    return [...by.entries()].sort((a, b) => b[1] - a[1]).map(([city, value], i) => ({ city, value, pct: Math.round((value / max) * 100), color: DashboardPage.COLORS[i % DashboardPage.COLORS.length] }));
  });

  color(i: number): string { return DashboardPage.COLORS[i % DashboardPage.COLORS.length]; }
  pct(a: number, b: number): number { return b ? Math.round((a / b) * 100) : 0; }
  accommodation(id?: string | null) { return this.content.accommodationForStop(id); }
  transportFor(stopId?: string | null) { return this.transportLegs().find((l) => l.to_stop_id === stopId); }
  destination(city: string) { return this.content.destinationByCity(city); }
  activitiesForStop(stopId?: string | null): string[] { return this.activities().filter((a) => a.stop_id === stopId).map((a) => a.title); }

  private static readonly MONTHS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

  weatherForCity(city: string) {
    const n = city.toLowerCase();
    return this.content.content().weather.find((w) => n.includes(w.city.toLowerCase()) || w.city.toLowerCase().includes(n));
  }
  private stopDates(stop: { start_date?: string | null; end_date?: string | null }): string[] {
    if (!stop.start_date) return [];
    const out: string[] = [];
    const end = new Date((stop.end_date ?? stop.start_date) + 'T00:00:00');
    for (const d = new Date(stop.start_date + 'T00:00:00'); d <= end; d.setDate(d.getDate() + 1)) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return out;
  }
  weatherPills(stop: { city: string; start_date?: string | null; end_date?: string | null }) {
    const w = this.weatherForCity(stop.city);
    if (!w) return [];
    return this.stopDates(stop).map((date) => {
      const d = new Date(date + 'T00:00:00');
      return { date, label: `${d.getDate()} ${DashboardPage.MONTHS[d.getMonth()]}`, icon: w.icon || '🌤️', high: w.high ?? '—', low: w.low ?? '—', rain: w.rain ?? '—' };
    });
  }

  readonly openStop = signal<string | null>(null);
  readonly editingNote = signal<string | null>(null);
  readonly noteDraft = signal('');

  noteFor(city: string): string { return this.content.noteForCity(city); }
  startNote(city: string): void { this.noteDraft.set(this.noteFor(city)); this.editingNote.set(city); }
  onNoteInput(e: Event): void { this.noteDraft.set((e.target as HTMLTextAreaElement).value); }
  async saveNote(city: string): Promise<void> { await this.content.saveNote(city, this.noteDraft()); this.editingNote.set(null); }
  readonly heroImage = computed(() => {
    const first = this.stops()[0];
    const url = first ? this.content.destinationByCity(first.city)?.image_url : null;
    return url ? `url('${url}')` : '';
  });
  toggleStop(stop: { id?: string; city: string }): void {
    const key = stop.id ?? stop.city;
    this.openStop.set(this.openStop() === key ? null : key);
  }

  constructor() {
    effect(() => {
      const first = this.stops()[0];
      if (first && !this.seeded) {
        this.seeded = true;
        this.openStop.set(first.id ?? first.city);
      }
    });
  }
  private seeded = false;
  isCurrent(stop: { start_date?: string | null; end_date?: string | null }): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return (stop.start_date ?? '') <= today && today <= (stop.end_date ?? stop.start_date ?? '');
  }

  ngAfterViewInit(): void { setTimeout(() => this.initMap(), 0); }
  ngOnDestroy(): void { this.map?.remove(); }

  private initMap(): void {
    const el = document.getElementById('dash-map');
    if (!el || typeof L === 'undefined') return;
    this.map = L.map(el, { scrollWheelZoom: true });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri · © OpenStreetMap', maxZoom: 16,
    }).addTo(this.map);
    const pts: [number, number][] = [];
    const seen = new Set<string>();
    this.stops().forEach((stop, idx) => {
      const d = this.content.destinationByCity(stop.city);
      if (!d?.lat || !d?.lng || seen.has(stop.city)) return;
      seen.add(stop.city);
      const coords: [number, number] = [d.lat, d.lng];
      const dest = this.content.destinationByCity(stop.city);
      const lodge = this.accommodation(stop.id);
      const tr = this.transportFor(stop.id);
      const acts = this.activitiesForStop(stop.id);
      const wx = this.weatherForCity(stop.city);
      const fiche = new URL('sheets?city=' + encodeURIComponent(stop.city), document.baseURI).href;
      let popup = '<div class="popup-card">';
      if (dest?.image_url) popup += `<div class="popup-img" style="background-image:url('${dest.image_url}')"></div>`;
      popup += '<div class="popup-body">';
      popup += `<div class="popup-title">${stop.city}${dest?.name_jp ? ' <span class="popup-jp">' + dest.name_jp + '</span>' : ''}</div>`;
      popup += `<div class="popup-dates">📅 ${formatRange(stop.start_date, stop.end_date)} · ${nightsLabel(stop)}</div>`;
      if (lodge) popup += `<div class="popup-detail">🏨 ${lodge.url ? `<a href="${lodge.url}" target="_blank" rel="noopener" class="cell-link">${lodge.name}</a>` : lodge.name}</div>`;
      if (tr) popup += `<div class="popup-detail">🚄 ${tr.duration || tr.mode}${tr.price ? ' · ' + euro(tr.price) : ''}</div>`;
      if (acts.length) popup += `<div class="popup-detail popup-activities">📍 ${acts.slice(0, 3).join(' · ')}</div>`;
      if (wx) popup += `<div class="popup-detail">${wx.icon} ${wx.high}°C / ${wx.low}°C</div>`;
      popup += `<a class="popup-cta" href="${fiche}">Voir la fiche complète →</a>`;
      popup += '</div></div>';
      L.marker(coords, { icon: L.divIcon({ className: 'custom-marker-wrapper', html: `<div class="custom-marker" style="background:${this.color(idx)}">${idx + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) })
        .addTo(this.map).bindPopup(popup, { maxWidth: 280, className: 'custom-popup' });
      L.marker(coords, { icon: L.divIcon({ className: 'marker-label-wrapper', html: `<div class="marker-label">${stop.city}</div>`, iconSize: [100, 20], iconAnchor: [-18, 10] }), interactive: false }).addTo(this.map);
      pts.push(coords);
    });
    if (pts.length > 1) L.polyline(pts, { color: '#b23a2e', weight: 2.5, opacity: 0.6, dashArray: '8,8' }).addTo(this.map);
    if (pts.length) this.map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    else this.map.setView([36.2, 138.2], 6);
    setTimeout(() => this.map?.invalidateSize(), 150);
  }
}

function stopId(s: { id?: string }): string | undefined { return s.id; }
