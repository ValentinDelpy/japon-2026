import { Content } from '../../core/models';
import { FieldDef } from '../entity/entity-config';

export interface NestedConfig {
  parentTable: string;
  childTable: string;
  fk: string;
  title: string;
  icon: string;
  parentSingular: string;
  childSingular: string;
  parentFields: FieldDef[];
  parentColumns: { key: string; label: string }[];
  childFields: FieldDef[];
  childColumns: { key: string; label: string }[];
  rows: (c: Content) => { parent: any; children: any[] }[];
  parentDefaults?: Record<string, unknown>;
  childDefaults?: Record<string, unknown>;
}

export const NESTED: Record<string, NestedConfig> = {
  packing: {
    parentTable: 'packing_categories', childTable: 'packing_items', fk: 'category_id',
    title: 'Packing List', icon: '🎒', parentSingular: 'catégorie', childSingular: 'élément',
    parentColumns: [{ key: 'label', label: 'Catégorie' }, { key: 'icon', label: 'Icône' }],
    childColumns: [{ key: 'label', label: 'Élément' }, { key: 'required', label: 'Obligatoire' }],
    parentFields: [{ key: 'label', label: 'Catégorie' }, { key: 'icon', label: 'Emoji' }],
    childFields: [
      { key: 'label', label: 'Élément', full: true },
      { key: 'quantity', label: 'Quantité' },
      { key: 'priority', label: 'Priorité', type: 'select', options: ['', 'haute', 'moyenne', 'basse'] },
      { key: 'required', label: 'Obligatoire', type: 'checkbox' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    rows: (c) => c.packingCategories.map((p) => ({ parent: p, children: p.items })),
    childDefaults: { required: false },
  },
  checklist: {
    parentTable: 'checklist_phases', childTable: 'checklist_tasks', fk: 'phase_id',
    title: 'Check-list départ', icon: '✅', parentSingular: 'phase', childSingular: 'tâche',
    parentColumns: [{ key: 'label', label: 'Phase' }, { key: 'icon', label: 'Icône' }],
    childColumns: [{ key: 'label', label: 'Tâche' }, { key: 'due_date', label: 'Échéance' }],
    parentFields: [{ key: 'label', label: 'Phase' }, { key: 'icon', label: 'Emoji' }, { key: 'color', label: 'Couleur' }],
    childFields: [
      { key: 'label', label: 'Tâche', full: true },
      { key: 'due_date', label: 'Échéance', type: 'date' },
      { key: 'priority', label: 'Priorité', type: 'select', options: ['', 'haute', 'moyenne', 'basse'] },
      { key: 'status', label: 'Statut', type: 'select', options: ['todo', 'doing', 'done'] },
      { key: 'link', label: 'Lien', full: true },
    ],
    rows: (c) => c.checklistPhases.map((p) => ({ parent: p, children: p.tasks })),
    childDefaults: { status: 'todo' },
  },
  moodboard: {
    parentTable: 'moodboard_sections', childTable: 'moodboard_images', fk: 'section_id',
    title: 'Moodboard', icon: '📸', parentSingular: 'section', childSingular: 'image',
    parentColumns: [{ key: 'city', label: 'Section' }, { key: 'name_jp', label: 'Japonais' }],
    childColumns: [{ key: 'caption', label: 'Légende' }, { key: 'url', label: 'URL' }],
    parentFields: [
      { key: 'city', label: 'Section' }, { key: 'name_jp', label: 'Japonais' }, { key: 'color', label: 'Couleur' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
    childFields: [
      { key: 'url', label: 'URL image', full: true },
      { key: 'alt', label: 'Texte alternatif' }, { key: 'caption', label: 'Légende' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
    rows: (c) => c.moodboardSections.map((p) => ({ parent: p, children: p.images })),
    parentDefaults: { visible: true },
    childDefaults: { visible: true },
  },
  japan101: {
    parentTable: 'japan101_sections', childTable: 'japan101_items', fk: 'section_id',
    title: 'Japon 101', icon: '🇯🇵', parentSingular: 'thème', childSingular: 'question',
    parentColumns: [{ key: 'title', label: 'Thème' }, { key: 'icon', label: 'Icône' }],
    childColumns: [{ key: 'question', label: 'Question' }],
    parentFields: [{ key: 'title', label: 'Thème' }, { key: 'icon', label: 'Emoji' }, { key: 'visible', label: 'Visible', type: 'checkbox' }],
    childFields: [
      { key: 'question', label: 'Question', full: true },
      { key: 'answer', label: 'Réponse (HTML autorisé)', type: 'textarea' },
    ],
    rows: (c) => c.japan101Sections.map((p) => ({ parent: p, children: p.items })),
    parentDefaults: { visible: true },
  },
  logistics: {
    parentTable: 'logistics_sections', childTable: 'logistics_items', fk: 'section_id',
    title: 'Logistique', icon: '🚉', parentSingular: 'rubrique', childSingular: 'info',
    parentColumns: [{ key: 'title', label: 'Rubrique' }, { key: 'icon', label: 'Icône' }],
    childColumns: [{ key: 'text', label: 'Information' }],
    parentFields: [{ key: 'title', label: 'Rubrique' }, { key: 'icon', label: 'Emoji' }, { key: 'color', label: 'Couleur' }],
    childFields: [{ key: 'text', label: 'Information (HTML autorisé)', type: 'textarea' }],
    rows: (c) => c.logisticsSections.map((p) => ({ parent: p, children: p.items })),
  },
};
