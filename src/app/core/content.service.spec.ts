import { TestBed } from '@angular/core/testing';
import { assembleContent, ContentService, RawContent } from './content.service';

function emptyRaw(): RawContent {
  return {
    trips: [], destinations: [], stops: [], days: [], activities: [], transportLegs: [],
    accommodations: [], reservations: [], restaurants: [], souvenirs: [], packingCategories: [],
    packingItems: [], checklistPhases: [], checklistTasks: [], phrases: [], culturalEvents: [],
    moodboardSections: [], moodboardImages: [], photos: [], weather: [], logisticsSections: [],
    logisticsItems: [], japan101Sections: [], japan101Items: [], surpriseItems: [], notes: [],
  };
}

describe('assembleContent', () => {
  it('rattache les restaurants à leur destination', () => {
    const raw = emptyRaw();
    raw.destinations = [{ id: 'd1', slug: 'tokyo', name: 'Tokyo', highlights: ['a'], fun_facts: ['b'] }];
    raw.restaurants = [
      { id: 'r1', destination_id: 'd1', name: 'Ichiran', order_index: 0 },
      { id: 'r2', destination_id: 'd2', name: 'Autre', order_index: 0 },
    ];
    const content = assembleContent(raw);
    expect(content.destinations[0].restaurants.map((r) => r.name)).toEqual(['Ichiran']);
    expect(content.restaurants.length).toBe(2);
  });

  it('mappe highlights/fun_facts et tolère les colonnes absentes', () => {
    const raw = emptyRaw();
    raw.destinations = [{ id: 'd1', slug: 'kyoto', name: 'Kyoto' }];
    const [d] = assembleContent(raw).destinations;
    expect(d.highlights).toEqual([]);
    expect(d.funFacts).toEqual([]);
    expect(d.restaurants).toEqual([]);
  });

  it('imbrique les enfants (packing, checklist, moodboard, japon, logistique)', () => {
    const raw = emptyRaw();
    raw.packingCategories = [{ id: 'c1', label: 'Docs', order_index: 0 }];
    raw.packingItems = [{ id: 'i1', category_id: 'c1', label: 'Passeport', order_index: 0 }];
    raw.checklistPhases = [{ id: 'p1', label: 'Avant', order_index: 0 }];
    raw.checklistTasks = [{ id: 't1', phase_id: 'p1', label: 'Visa', order_index: 0 }];
    raw.moodboardSections = [{ id: 's1', city: 'Tokyo', order_index: 0 }];
    raw.moodboardImages = [{ id: 'm1', section_id: 's1', url: 'u', order_index: 0 }];
    raw.japan101Sections = [{ id: 'j1', title: 'Étiquette', order_index: 0 }];
    raw.japan101Items = [{ id: 'ji1', section_id: 'j1', question: 'Q', order_index: 0 }];
    raw.logisticsSections = [{ id: 'l1', title: 'Train', order_index: 0 }];
    raw.logisticsItems = [{ id: 'li1', section_id: 'l1', text: 'Suica', order_index: 0 }];
    const c = assembleContent(raw);
    expect(c.packingCategories[0].items.length).toBe(1);
    expect(c.checklistPhases[0].tasks.length).toBe(1);
    expect(c.moodboardSections[0].images.length).toBe(1);
    expect(c.japan101Sections[0].items.length).toBe(1);
    expect(c.logisticsSections[0].items.length).toBe(1);
  });

  it('trie par order_index', () => {
    const raw = emptyRaw();
    raw.stops = [{ id: 'a', city: 'B', order_index: 2 }, { id: 'b', city: 'A', order_index: 1 }];
    expect(assembleContent(raw).stops.map((s) => s.city)).toEqual(['A', 'B']);
  });

  it('renvoie un voyage null si aucun trip', () => {
    expect(assembleContent(emptyRaw()).trip).toBeNull();
  });
});

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
