"use client";

/**
 * Calixo Platform - Social automation rule state.
 * The only place allowed to call SocialAutomationRuleRegistry directly.
 */

import { useCallback, useEffect, useState } from "react";
import { socialAutomationRuleRegistry } from "@/core/social";
import type { SocialAutomationAction, SocialAutomationRule } from "@/core/social";
import type { AutomationCondition } from "@/core/platform/execution";

export function useSocialAutomationRules(organizationId: string) {
  const [rules, setRules] = useState<SocialAutomationRule[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRules(socialAutomationRuleRegistry.list());
  }, []);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const createRule = useCallback(
    async (input: { name: string; description: string; action: SocialAutomationAction; condition: AutomationCondition }) => {
      const rule = await socialAutomationRuleRegistry.create({ ...input, organizationId });
      refresh();
      return rule;
    },
    [organizationId, refresh]
  );

  const toggleActive = useCallback(
    async (id: string, isActive: boolean) => {
      setBusyId(id);
      await socialAutomationRuleRegistry.setActive(id, isActive);
      refresh();
      setBusyId(null);
    },
    [refresh]
  );

  const deleteRule = useCallback(
    (id: string) => {
      socialAutomationRuleRegistry.delete(id);
      refresh();
    },
    [refresh]
  );

  const runRule = useCallback(
    async (id: string, posts: Parameters<typeof socialAutomationRuleRegistry.run>[1]) => {
      setBusyId(id);
      const result = await socialAutomationRuleRegistry.run(id, posts);
      refresh();
      setBusyId(null);
      return result;
    },
    [refresh]
  );

  return { rules, busyId, createRule, toggleActive, deleteRule, runRule };
}
