"use client";

/**
 * Calixo Reports Center - template list state.
 * The only place allowed to call TemplateRegistry.
 */

import { useCallback, useEffect, useState } from "react";
import { templateRegistry } from "@/core/reports";
import type { ReportCategory, ReportDefinition, ReportTemplate } from "@/core/reports";

export function useTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  const refresh = useCallback(() => {
    setTemplates(templateRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const search = useCallback((query: string, category?: ReportCategory): ReportTemplate[] => {
    const base = query.trim() ? templateRegistry.discover(query) : templateRegistry.list();
    return category ? base.filter(t => t.category === category) : base;
  }, []);

  const categories = useCallback(() => templateRegistry.categories(), []);

  const clone = useCallback(
    (id: string, overrides?: Partial<Pick<ReportTemplate, "name" | "description">>) => {
      const cloned = templateRegistry.clone(id, overrides);
      refresh();
      return cloned;
    },
    [refresh]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const template = templateRegistry.lookup(id);
      if (!template) return;
      if (template.isFavorite) templateRegistry.unmarkFavorite(id);
      else templateRegistry.markFavorite(id);
      refresh();
    },
    [refresh]
  );

  const toReportDraft = useCallback(
    (id: string): Pick<ReportDefinition, "module" | "category" | "widgets" | "metrics" | "dimensions" | "defaultLayout"> | undefined =>
      templateRegistry.toReportDraft(id),
    []
  );

  return { templates, search, categories, clone, toggleFavorite, toReportDraft, refresh };
}
