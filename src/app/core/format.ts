// Petits formateurs de présentation (dates FR, euros, nuits).

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value + (value.length === 10 ? 'T00:00:00' : ''));
  return isNaN(d.getTime()) ? null : d;
}

export function formatDay(d?: string | null): string {
  const date = toDate(d);
  if (!date) return '';
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDayShort(d?: string | null): string {
  const date = toDate(d);
  return date ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}` : '';
}

export function formatRange(start?: string | null, end?: string | null): string {
  const s = toDate(start);
  if (!s) return '';
  const e = toDate(end);
  if (!e || s.getTime() === e.getTime()) return formatDay(start);
  if (s.getMonth() === e.getMonth()) return `${DAYS[s.getDay()]} ${s.getDate()} → ${formatDay(end)}`;
  return `${formatDay(start)} → ${formatDay(end)}`;
}

export function nights(stop: { start_date?: string | null; end_date?: string | null; nights?: number }): number {
  const s = toDate(stop.start_date);
  const e = toDate(stop.end_date);
  if (s && e) return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
  return stop.nights ?? 0;
}

export function nightsLabel(stop: { start_date?: string | null; end_date?: string | null; nights?: number }): string {
  const n = nights(stop);
  if (n === 0) return 'Journée';
  return `${n} nuit${n > 1 ? 's' : ''}`;
}

export function euro(value?: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' €';
}

export function daysBetween(from: string, to: string): number {
  return Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}
