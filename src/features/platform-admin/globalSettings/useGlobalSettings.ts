"use client";

/**
 * Internal Plan Management Console — Section 8: Global Settings.
 *
 * Reads/writes the real `platformGlobalSettingsPlatformAPI`. `trialAiCredits`
 * writes through to the real `trial` tier's `limits.aiCredits` (the same
 * field Section 1/4 edit) inside the engine itself — not a second, duplicate
 * number kept in sync by hand.
 */
import { useCallback, useState } from "react";
import { platformGlobalSettingsPlatformAPI } from "@/core/platform/commercial";
import type { PlatformGlobalSettings } from "@/core/platform/commercial";
import { useInternalRole } from "../internalRole";
import { commitPlanChange } from "../commitPlanChange";
import { saveGlobalSettingsAction } from "@/core/platform/configStore/actions";

export function useGlobalSettings() {
  const { role } = useInternalRole();
  const [, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const settings = platformGlobalSettingsPlatformAPI.get();

  const update = useCallback(
    (patch: Partial<PlatformGlobalSettings>) => {
      const before = settings;
      const description = "Updated global commercial settings";
      platformGlobalSettingsPlatformAPI.update(patch);
      void saveGlobalSettingsAction(patch, description);
      void commitPlanChange({
        entityType: "platform-global-settings",
        entityId: "singleton",
        before,
        after: { ...before, ...patch },
        actor: role,
        description,
      });
      refresh();
    },
    [settings, role, refresh]
  );

  return { settings, update };
}
