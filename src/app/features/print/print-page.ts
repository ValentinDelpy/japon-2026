import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { formatRange } from '../../core/format';

interface CalDay { num: number; date: string; events: string[]; }
interface CalMonth { label: string; days: (CalDay | null)[]; }

@Component({
  selector: 'app-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header no-print"><h1>Impression <span class="jp-accent">印刷</span></h1><p class="subtitle">Calendrier du voyage, optimisé pour l'impression.</p></div>
    <div class="print-actions no-print"><button class="btn btn-primary" (click)="print()">🖨️ Imprimer / PDF</button></div>

    @for (m of months(); track m.label) {
      <div class="print-calendar mb-2">
        <div class="calendar-header">{{ m.label }}</div>
        <div class="calendar-grid">
          @for (d of weekdays; track d) { <div class="calendar-day-header">{{ d }}</div> }
          @for (day of m.days; track $index) {
            @if (day) {
              <div class="calendar-day"><div class="day-num">{{ day.num }}</div>@for (e of day.events; track e) { <div class="day-event">{{ e }}</div> }</div>
            } @else { <div class="calendar-day empty"></div> }
          }
        </div>
      </div>
    }

    <div class="itinerary-full-table mt-2">
      <div class="map-title-bar">📋 Étapes</div>
      <div class="table-scroll"><table class="iti-table">
        <thead><tr><th>#</th><th>Dates</th><th>Lieu</th><th>Activités</th></tr></thead>
        <tbody>
          @for (stop of stops(); track stop.id ?? stop.city; let i = $index) {
            <tr><td>{{ i + 1 }}</td><td class="row-date">{{ formatRange(stop.start_date, stop.end_date) }}</td><td class="row-place">{{ stop.city }}</td><td class="text-sm">{{ activitiesFor(stop.id).join(', ') || '—' }}</td></tr>
          }
        </tbody>
      </table></div>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class PrintPage {
  private readonly content = inject(ContentService);
  readonly stops = this.content.stops;
  readonly formatRange = formatRange;
  readonly weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  activitiesFor(stopId?: string | null): string[] { return this.content.content().activities.filter((a) => a.stop_id === stopId).map((a) => a.title); }

  readonly months = computed<CalMonth[]>(() => {
    const days = this.content.days();
    if (!days.length) return [];
    const stops = new Map(this.content.stops().map((s) => [s.id, s]));
    const events = new Map<string, string[]>();
    for (const d of days) {
      const city = stops.get(d.stop_id ?? '')?.city;
      if (city && !events.has(d.date)) events.set(d.date, [city]);
    }
    const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const first = new Date(days[0].date + 'T00:00:00');
    const last = new Date(days[days.length - 1].date + 'T00:00:00');
    const result: CalMonth[] = [];
    let cur = new Date(first.getFullYear(), first.getMonth(), 1);
    while (cur <= last) {
      const year = cur.getFullYear(); const month = cur.getMonth();
      const pad = (new Date(year, month, 1).getDay() + 6) % 7;
      const dim = new Date(year, month + 1, 0).getDate();
      const cells: (CalDay | null)[] = Array(pad).fill(null);
      for (let d = 1; d <= dim; d++) {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({ num: d, date: ds, events: events.get(ds) ?? [] });
      }
      result.push({ label: `${MONTHS[month]} ${year}`, days: cells });
      cur = new Date(year, month + 1, 1);
    }
    return result;
  });

  print(): void { window.print(); }
}
