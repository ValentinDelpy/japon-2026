import { resolveToday, isoDate, TodayInput } from './today';

const trip = { slug: 't', title: 'T', travelers: 4, currency: 'EUR', theme: 'light', start_date: '2026-11-18', end_date: '2026-11-25' };
const stops = [
  { id: 's1', city: 'Tokyo', start_date: '2026-11-18', end_date: '2026-11-21', order_index: 0 },
  { id: 's2', city: 'Kyoto', start_date: '2026-11-22', end_date: '2026-11-25', order_index: 1 },
];
const days = [
  { id: 'd1', stop_id: 's1', date: '2026-11-18', order_index: 0 },
  { id: 'd2', stop_id: 's1', date: '2026-11-19', order_index: 1 },
  { id: 'd3', stop_id: 's2', date: '2026-11-22', order_index: 2 },
];
const accommodations = [{ id: 'a1', stop_id: 's1', name: 'Hôtel Tokyo' }];
const activities = [
  { id: 'x1', day_id: 'd2', time: '09:00', title: 'Senso-ji', order_index: 0 },
  { id: 'x2', day_id: 'd2', time: '13:00', title: 'Déjeuner', order_index: 1 },
  { id: 'x3', day_id: 'd2', time: '15:00', title: 'Akihabara', order_index: 2 },
];
const input: TodayInput = { trip, stops, days, activities, accommodations };

describe('isoDate', () => {
  it('formate en date locale YYYY-MM-DD', () => {
    expect(isoDate(new Date(2026, 10, 9))).toBe('2026-11-09');
  });
});

describe('resolveToday', () => {
  it('phase before + jours restants', () => {
    const r = resolveToday(input, new Date(2026, 10, 1, 10, 0));
    expect(r.phase).toBe('before');
    expect(r.daysUntilStart).toBe(17);
  });

  it('phase during : étape, hébergement, activités triées, prochaine activité', () => {
    const r = resolveToday(input, new Date(2026, 10, 19, 12, 0));
    expect(r.phase).toBe('during');
    expect(r.stop?.city).toBe('Tokyo');
    expect(r.accommodation?.name).toBe('Hôtel Tokyo');
    expect(r.activities.map((a) => a.title)).toEqual(['Senso-ji', 'Déjeuner', 'Akihabara']);
    expect(r.nextActivity?.title).toBe('Déjeuner');
    expect(r.dayIndex).toBe(2);
    expect(r.totalDays).toBe(3);
    expect(r.progressPct).toBeGreaterThan(0);
  });

  it('retourne null quand toutes les activités sont passées', () => {
    const r = resolveToday(input, new Date(2026, 10, 19, 23, 0));
    expect(r.nextActivity).toBeNull();
  });

  it('phase after', () => {
    expect(resolveToday(input, new Date(2026, 11, 1, 10, 0)).phase).toBe('after');
  });

  it('phase none sans voyage', () => {
    expect(resolveToday({ ...input, trip: null }, new Date()).phase).toBe('none');
  });
});
