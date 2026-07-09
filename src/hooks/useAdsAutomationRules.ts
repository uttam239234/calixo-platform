"use client";

/**
 * Calixo Platform - Ads automation rule state.
 * The only place allowed to call AdsAutomationRuleRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { adsAutomationRuleRegistry } from "@/core/ads";
import type { AdsAutomationAction, AdsAutomationRule } from "@/core/ads";
import type { AutomationCondition } from "@/core/platform/execution";

export function useAdsAutomationRules(organizationId: string) {
  const [rules, setRules] = useState<AdsAutomationRule[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRules(adsAutomationRuleRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const createRule = useCallback(
    async (input: { name: string; description: string; action: AdsAutomationAction; condition: AutomationCondition }) => {
      const rule = await adsAutomationRuleRegistry.create({ ...input, organizationId });
      refresh();
      return rule;
    },
    [organizationId, refresh]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      setBusyId(id);
      await adsAutomationRuleRegistry.setActive(id, isActive);
      refresh();
      setBusyId(null);
    },
    [refresh]
  );

  const deleteRule = useCallback(
    (id: string) => {
      adsAutomationRuleRegistry.delete(id);
      refresh();
    },
    [refresh]
  );

  const runRule = useCallback(
    async (id: string, campaigns: Parameters<typeof adsAutomationRuleRegistry.run>[1]) => {
      setBusyId(id);
      const result = await adsAutomationRuleRegistry.run(id, campaigns);
      refresh();
      setBusyId(null);
      return result;
    },
    [refresh]
  );

  return { rules, busyId, createRule, toggleActive, deleteRule, runRule };
}
