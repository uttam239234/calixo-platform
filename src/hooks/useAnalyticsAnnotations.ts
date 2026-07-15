"use client";

/**
 * Calixo Platform - Analytics chart annotation state.
 * The only place allowed to call AnalyticsAnnotationRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { analyticsAnnotationRegistry } from "@/core/analytics";
import type { AnalyticsAnnotation } from "@/core/analytics";
import { useUser } from "@clerk/nextjs";

const FALLBACK_AUTHOR = "You";

export function useAnalyticsAnnotations(chartId: string) {
  const { user: sessionUser } = useUser();
  const author = sessionUser?.fullName ?? sessionUser?.firstName ?? FALLBACK_AUTHOR;
  const [annotations, setAnnotations] = useState<AnalyticsAnnotation[]>([]);

  const refresh = useCallback(() => {
    setAnnotations(analyticsAnnotationRegistry.list(chartId));
  }, [chartId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const addAnnotation = useCallback(
    (date: string, note: string) => {
      const annotation = analyticsAnnotationRegistry.create(chartId, date, note, author);
      refresh();
      return annotation;
    },
    [chartId, author, refresh]
  );

  const removeAnnotation = useCallback(
    (id: string) => {
      analyticsAnnotationRegistry.remove(id);
      refresh();
    },
    [refresh]
  );

  return { annotations, addAnnotation, removeAnnotation, refresh };
}
