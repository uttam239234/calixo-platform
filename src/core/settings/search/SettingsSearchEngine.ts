/**
 * Calixo Platform - Settings Search Engine
 *
 * Ranked, multi-criteria search over the SettingsRegistry — keyword,
 * category, module, and tag matching combined into a single score.
 * This is deliberately separate from SettingsRegistry.discover(), which
 * is just a plain substring filter; this engine ranks and combines
 * multiple signals.
 */

import { settingsRegistry, SettingsRegistry } from "../registry/SettingsRegistry";
import type { ModuleCategory } from "@/core/modules/ModuleTypes";
import type { SettingsSearchParams, SettingsSearchResult } from "../types";

export class SettingsSearchEngine {
  constructor(private registry: SettingsRegistry = settingsRegistry) {}

  search(params: SettingsSearchParams): SettingsSearchResult[] {
    const q = params.query?.trim().toLowerCase();
    const results: SettingsSearchResult[] = [];

    for (const setting of this.registry.list()) {
      let score = 0;
      const matchedOn: string[] = [];

      if (q) {
        if (setting.label.toLowerCase().includes(q)) {
          score += 5;
          matchedOn.push("label");
        }
        if (setting.key.toLowerCase().includes(q)) {
          score += 4;
          matchedOn.push("key");
        }
        if (setting.description.toLowerCase().includes(q)) {
          score += 2;
          matchedOn.push("description");
        }
        if (setting.tags.some(t => t.toLowerCase().includes(q))) {
          score += 3;
          matchedOn.push("tags");
        }
      }
      if (params.category && setting.category === params.category) {
        score += 3;
        matchedOn.push("category");
      }
      if (params.module && setting.module === params.module) {
        score += 3;
        matchedOn.push("module");
      }
      if (params.tag && setting.tags.includes(params.tag)) {
        score += 3;
        matchedOn.push("tag");
      }

      const noCriteria = !q && !params.category && !params.module && !params.tag;
      if (score > 0 || noCriteria) {
        results.push({ setting, score, matchedOn });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  byKeyword(query: string): SettingsSearchResult[] {
    return this.search({ query });
  }

  byCategory(category: string): SettingsSearchResult[] {
    return this.search({ category });
  }

  byModule(module: ModuleCategory): SettingsSearchResult[] {
    return this.search({ module });
  }

  byTag(tag: string): SettingsSearchResult[] {
    return this.search({ tag });
  }
}

export const settingsSearchEngine = new SettingsSearchEngine();
