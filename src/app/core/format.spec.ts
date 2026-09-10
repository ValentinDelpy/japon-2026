import { euro, formatRange, nights, nightsLabel } from './format';

describe('format', () => {
  describe('nights', () => {
    it('calcule depuis les dates', () => {
      expect(nights({ start_date: '2026-11-18', end_date: '2026-11-21' })).toBe(3);
    });
    it('vaut 0 le même jour', () => {
      expect(nights({ start_date: '2026-11-18', end_date: '2026-11-18' })).toBe(0);
    });
    it('retombe sur la valeur stockée sans dates', () => {
      expect(nights({ nights: 2 })).toBe(2);
    });
  });

  describe('nightsLabel', () => {
    it('affiche « Journée » pour 0 nuit', () => {
      expect(nightsLabel({ start_date: '2026-11-18', end_date: '2026-11-18' })).toBe('Journée');
    });
    it('gère le pluriel', () => {
      expect(nightsLabel({ start_date: '2026-11-18', end_date: '2026-11-21' })).toBe('3 nuits');
    });
    it('gère le singulier', () => {
      expect(nightsLabel({ start_date: '2026-11-18', end_date: '2026-11-19' })).toBe('1 nuit');
    });
  });

  describe('euro', () => {
    it('formate un montant', () => {
      expect(euro(2505)).toContain('505');
    });
    it('affiche un tiret si absent', () => {
      expect(euro(null)).toBe('—');
    });
  });

  describe('formatRange', () => {
    it('produit une plage avec flèche', () => {
      expect(formatRange('2026-11-18', '2026-11-21')).toContain('→');
    });
    it('reste vide sans date', () => {
      expect(formatRange(null, null)).toBe('');
    });
  });
});
