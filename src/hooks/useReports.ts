"use client";

/**
 * Calixo Reports Center - report list/detail state.
 * The only place allowed to call ReportRegistry and ReportEngine for the
 * "current report" concern — components never import either directly.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateId } from "@/shared/utils/string";
import { reportRegistry, reportEngine } from "@/core/reports";
import type { ReportCategory, ReportDataset, ReportDefinition, ReportExecutionRecord, ReportFilter } from "@/core/reports";
import { DEMO_OWNER } from "@/components/reports/constants";
import type { HistoryRecordView } from "@/components/reports/types";

export function useReports() {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [datasetsById, setDatasetsById] = useState<Record<string, ReportDataset>>({});
  const [executing, setExecuting] = useState(false);
  const [historyUsers, setHistoryUsers] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    setReports(reportRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const currentReport = useMemo(() => reports.find(r => r.id === currentReportId) ?? null, [reports, currentReportId]);
  const dataset = currentReportId ? datasetsById[currentReportId] : undefined;

  const selectReport = useCallback((id: string) => {
    setCurrentReportId(id);
  }, []);

  const search = useCallback((query: string, category?: ReportCategory): ReportDefinition[] => {
    const base = query.trim() ? reportRegistry.discover(query) : reportRegistry.list();
    return category ? base.filter(r => r.category === category) : base;
  }, []);

  const executeReport = useCallback(async (id: string): Promise<{ record: ReportExecutionRecord; dataset?: ReportDataset }> => {
    setExecuting(true);
    try {
      const result = await reportEngine.execute(id);
      setHistoryUsers(prev => ({ ...prev, [result.record.id]: DEMO_OWNER }));
      if (result.dataset) {
        const resolvedDataset = result.dataset;
        setDatasetsById(prev => ({ ...prev, [id]: resolvedDataset }));
      }
      return result;
    } finally {
      setExecuting(false);
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const report = reportRegistry.lookup(id);
      if (!report) return;
      reportRegistry.markFavorite(id, !report.favorite);
      refresh();
    },
    [refresh]
  );

  const duplicateReport = useCallback(
    (id: string): ReportDefinition | undefined => {
      const source = reportRegistry.lookup(id);
      if (!source) return undefined;
      const now = new Date().toISOString();
      const duplicate: ReportDefinition = { ...source, id: generateId(16), name: `${source.name} (Copy)`, favorite: false, createdAt: now, updatedAt: now };
      reportRegistry.register(duplicate);
      refresh();
      return duplicate;
    },
    [refresh]
  );

  const registerReport = useCallback(
    (report: ReportDefinition) => {
      reportRegistry.register(report);
      refresh();
    },
    [refresh]
  );

  const getHistory = useCallback(
    (reportId?: string): HistoryRecordView[] => {
      return reportEngine.getHistory(reportId).map(record => ({ ...record, user: historyUsers[record.id] }));
    },
    [historyUsers]
  );

  const getFilters = useCallback((reportId: string) => reportEngine.load(reportId)?.filters ?? [], []);

  const applyFiltersToDataset = useCallback(
    (filters: ReportFilter[]) => {
      if (!currentReportId) return;
      setDatasetsById(prev => {
        const current = prev[currentReportId];
        if (!current) return prev;
        return { ...prev, [currentReportId]: reportEngine.applyFilters(current, filters) };
      });
    },
    [currentReportId]
  );

  const validate = useMemo(() => (currentReport ? reportEngine.validate(currentReport) : undefined), [currentReport]);
  const metadata = useMemo(() => (currentReportId ? reportEngine.getMetadata(currentReportId) : undefined), [currentReportId]);

  const groupByCategory = useCallback(() => reportRegistry.groupByCategory(), []);
  const groupByModule = useCallback(() => reportRegistry.groupByModule(), []);

  const favorites = useMemo(() => reports.filter(r => r.favorite), [reports]);
  const recent = useMemo(() => [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 10), [reports]);

  return {
    reports,
    currentReport,
    currentReportId,
    selectReport,
    search,
    executeReport,
    dataset,
    executing,
    toggleFavorite,
    duplicateReport,
    registerReport,
    getHistory,
    getFilters,
    applyFiltersToDataset,
    validate,
    metadata,
    groupByCategory,
    groupByModule,
    favorites,
    recent,
    refresh,
  };
}

export type UseReportsResult = ReturnType<typeof useReports>;
