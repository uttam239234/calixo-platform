"use client";

/**
 * Internal Plan Management Console — Section 7: Experiments.
 *
 * Reads/writes the real `featureFlagRegistry` — percentage rollout
 * (`rolloutPercent`) is a new, additive field this round added to
 * `FeatureFlagDefinition`, honored by `FeatureFlagEngine.evaluate()`'s
 * deterministic per-organization bucketing. Filtered to `category ===
 * "experimental"` flags only — this section doesn't manage module/
 * subscription-gated flags, which belong to Sections 1/3.
 */
import { useCallback, useState } from "react";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import type { FeatureFlagDefinition } from "@/core/platform/featureFlags";
import { useInternalRole } from "../internalRole";
import { commitPlanChange, type CommitPlanChangeResult } from "../commitPlanChange";
import { saveExperimentRolloutAction } from "@/core/platform/configStore/actions";

export function useExperiments() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const experiments = featureFlagRegistry.list().filter(f => f.category === "experimental");

  const setRollout = useCallback(
    async (flag: FeatureFlagDefinition, rolloutPercent: number): Promise<CommitPlanChangeResult> => {
      const before = flag.rolloutPercent ?? 0;
      const description = `Changed ${flag.label}'s rollout from ${before}% to ${rolloutPercent}%`;
      featureFlagRegistry.register({ ...flag, rolloutPercent });
      const saveResult = await saveExperimentRolloutAction(flag, rolloutPercent, description);
      if (!saveResult.ok) {
        refresh();
        return { error: saveResult.error };
      }
      const result = await commitPlanChange({
        entityType: "experiment-flag",
        entityId: flag.id,
        before,
        after: rolloutPercent,
        actor: role,
        description,
      });
      refresh();
      return result;
    },
    [role, refresh]
  );

  return { experiments, setRollout };
}
