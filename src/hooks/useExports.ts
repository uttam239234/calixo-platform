"use client";

/**
 * Calixo Reports Center - export state for the current report.
 * The only place allowed to call ExportEngine.
 */

import { useCallback, useEffect, useState } from "react";
import { exportEngine } from "@/core/reports";
import type { ExportFormat, ExportRecord } from "@/core/reports";

export function useExports(reportId: string | null) {
  const [history, setHistory] = useState<ExportRecord[]>([]);

  const refresh = useCallback(() => {
    setHistory(reportId ? exportEngine.getHistory(reportId) : []);
  }, [reportId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const formats = exportEngine.getSupportedFormats();

  const requestExport = useCallback(
    (format: ExportFormat, requestedBy = "current-user"): ExportRecord | undefined => {
      if (!reportId) return undefined;
      const record = exportEngine.requestExport({ reportId, format, requestedBy });
      refresh();
      return record;
    },
    [reportId, refresh]
  );

  return { history, formats, requestExport };
}
