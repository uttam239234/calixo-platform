"use client";

/**
 * Calixo Platform - Goals & Scorecards state.
 * The only place allowed to call GoalEngine.
 */

import { useCallback, useEffect, useState } from "react";
import { goalEngine } from "@/core/platform/goals";
import type { GoalScorecardEntry } from "@/core/platform/goals";

export function useGoals() {
  const [scorecard, setScorecard] = useState<GoalScorecardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setScorecard(goalEngine.getScorecard());
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  return { scorecard, loading, refresh };
}
