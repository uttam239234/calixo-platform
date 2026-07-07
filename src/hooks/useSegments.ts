"use client";

/**
 * Calixo Platform - Analytics Segments state.
 * The only place allowed to call SegmentRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { segmentRegistry, seedAnalyticsSegments } from "@/core/analytics";
import type { AnalyticsSegment, AnalyticsFilterState, SegmentKind } from "@/core/analytics";

const OWNER = "You";

export function useSegments() {
  const [segments, setSegments] = useState<AnalyticsSegment[]>([]);

  const refresh = useCallback(() => {
    seedAnalyticsSegments();
    setSegments(segmentRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const saveSegment = useCallback(
    (name: string, description: string, filters: AnalyticsFilterState, kind: SegmentKind = "custom") => {
      const segment = segmentRegistry.create({ name, description, kind, filters, owner: OWNER });
      refresh();
      return segment;
    },
    [refresh]
  );

  const removeSegment = useCallback(
    (id: string) => {
      segmentRegistry.remove(id);
      refresh();
    },
    [refresh]
  );

  return { segments, saveSegment, removeSegment, refresh };
}
