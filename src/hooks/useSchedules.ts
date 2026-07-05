"use client";

/**
 * Calixo Reports Center - schedule state.
 * The only place allowed to call ReportScheduler. Pass a reportId to
 * scope to one report (right panel), or null for every schedule across
 * all reports (left sidebar's "Scheduled Reports" section).
 */

import { useCallback, useEffect, useState } from "react";
import { reportScheduler, SCHEDULE_FREQUENCIES } from "@/core/reports";
import type { ExportFormat, ReportSchedule, ScheduleFrequency } from "@/core/reports";

export function useSchedules(reportId: string | null) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);

  const refresh = useCallback(() => {
    setSchedules(reportScheduler.list(reportId ? { reportId } : {}));
  }, [reportId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const createSchedule = useCallback(
    (params: { frequency: ScheduleFrequency; recipients: string[]; exportFormat?: ExportFormat }) => {
      if (!reportId) return undefined;
      const schedule = reportScheduler.create({ reportId, ...params });
      refresh();
      return schedule;
    },
    [reportId, refresh]
  );

  const pause = useCallback(
    (id: string) => {
      reportScheduler.pause(id);
      refresh();
    },
    [refresh]
  );

  const resume = useCallback(
    (id: string) => {
      reportScheduler.resume(id);
      refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    (id: string) => {
      reportScheduler.delete(id);
      refresh();
    },
    [refresh]
  );

  return { schedules, createSchedule, pause, resume, remove, frequencies: SCHEDULE_FREQUENCIES };
}
