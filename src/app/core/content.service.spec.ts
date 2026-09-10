import { TestBed } from '@angular/core/testing';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentService);
  });

  it('signale une erreur si Supabase n’est pas configuré', async () => {
    await service.load();
    expect(service.error()).toContain('Supabase non configuré');
  });

  it('met à jour le contenu localement (optimiste)', () => {
    service.update((c) => ({
      ...c,
      destinations: [{ id: 'd1', slug: 'tokyo', name: 'Tokyo', highlights: [], funFacts: [], restaurants: [] }],
    }));
    expect(service.destinationByCity('Tokyo')?.slug).toBe('tokyo');
  });
});
