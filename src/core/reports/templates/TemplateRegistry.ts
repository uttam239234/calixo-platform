/**
 * Calixo Platform - Report Template Registry
 *
 * Reusable report blueprints. Future modules contribute templates the
 * same way they contribute reports — this registry never assumes which
 * module a template comes from.
 */

import { appLogger } from "@/logging";
import { generateId } from "@/shared/utils/string";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { ReportCategory, ReportDefinition, ReportTemplate } from "../types";

export class TemplateRegistry {
  private templates: Map<string, ReportTemplate> = new Map();
  private favorites: Set<string> = new Set();

  register(template: ReportTemplate): void {
    if (this.templates.has(template.id)) {
      appLogger.warn("Reports.TemplateRegistry", `Template ${template.id} already registered`);
      return;
    }
    this.templates.set(template.id, template);
    appLogger.info("Reports.TemplateRegistry", `Template registered: ${template.id} (${template.category})`);
  }

  registerMany(templates: ReportTemplate[]): void {
    for (const template of templates) this.register(template);
  }

  unregister(id: string): void {
    this.templates.delete(id);
    this.favorites.delete(id);
  }

  lookup(id: string): ReportTemplate | undefined {
    const template = this.templates.get(id);
    return template ? { ...template, isFavorite: this.favorites.has(id) } : undefined;
  }

  list(params: { module?: ModuleCategory; category?: ReportCategory } = {}): ReportTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => !params.module || t.module === params.module)
      .filter(t => !params.category || t.category === params.category)
      .map(t => ({ ...t, isFavorite: this.favorites.has(t.id) }));
  }

  discover(query: string): ReportTemplate[] {
    const q = query.toLowerCase();
    return this.list().filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  categories(): ReportCategory[] {
    return [...new Set(Array.from(this.templates.values()).map(t => t.category))];
  }

  /** Creates and registers an editable copy of a template. */
  clone(id: string, overrides: Partial<Pick<ReportTemplate, "name" | "description">> = {}): ReportTemplate | undefined {
    const source = this.templates.get(id);
    if (!source) return undefined;
    const now = new Date().toISOString();
    const cloned: ReportTemplate = {
      ...source,
      id: generateId(16),
      name: overrides.name ?? `${source.name} (Copy)`,
      description: overrides.description ?? source.description,
      isDefault: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    this.register(cloned);
    return cloned;
  }

  markFavorite(id: string): void {
    if (this.templates.has(id)) this.favorites.add(id);
  }

  unmarkFavorite(id: string): void {
    this.favorites.delete(id);
  }

  listFavorites(): ReportTemplate[] {
    return Array.from(this.favorites)
      .map(id => this.templates.get(id))
      .filter((t): t is ReportTemplate => !!t)
      .map(t => ({ ...t, isFavorite: true }));
  }

  /** Bridges a template into the fields a ReportBuilder / ReportRegistry entry needs. */
  toReportDraft(id: string): Pick<ReportDefinition, "module" | "category" | "widgets" | "metrics" | "dimensions" | "defaultLayout"> | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;
    return {
      module: template.module,
      category: template.category,
      widgets: template.widgets,
      metrics: template.metrics,
      dimensions: template.dimensions,
      defaultLayout: template.defaultLayout,
    };
  }

  count(): number {
    return this.templates.size;
  }
}

export const templateRegistry = new TemplateRegistry();
