/**
 * Calixo Platform - Generic Dashboard-Builder Platform
 *
 * Extracted from the Dashboard module's own layout system so any module
 * (Dashboard, Analytics, and future ones) can offer named, persona-based
 * layouts with real create/clone/rename/delete/favourite/default/switch/
 * reset-to-template semantics WITHOUT re-implementing the same registry.
 * Parameterized by the module's own widget-key union — this file owns no
 * module-specific widget catalog or seed data.
 */

export interface DashboardWidgetConfig<TKey extends string = string> {
  key: TKey;
  visible: boolean;
  pinned: boolean;
  order: number;
}

export interface DashboardLayout<TKey extends string = string> {
  id: string;
  name: string;
  description: string;
  persona: string;
  widgets: DashboardWidgetConfig<TKey>[];
  owner: string;
  isDefault: boolean;
  isFavorite: boolean;
  isTemplate: boolean;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidgetCatalogEntry<TKey extends string = string> {
  key: TKey;
  label: string;
  description: string;
  group: string;
}
