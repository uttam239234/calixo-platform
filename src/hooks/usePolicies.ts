"use client";

/**
 * Calixo Roles & Permissions - policy list/CRUD state.
 * The only place allowed to call `policyPlatformAPI` — components never
 * import it directly. Scoped to a single organization via `Policy.scope.organizationIds`.
 */

import { useCallback, useEffect, useState } from "react";
import { policyPlatformAPI } from "@/core/platform/access";
import type { CreatePolicyRequest, Policy } from "@/access/types";

export function usePolicies(organizationId: string) {
  const [policies, setPolicies] = useState<Policy[]>([]);

  const refresh = useCallback(async () => {
    const all = await policyPlatformAPI.getAllPolicies();
    // Global policies (no organizationIds scope at all) apply everywhere and
    // are always shown; org-scoped ones only show for organizations they name —
    // this is what "policy isolation" means here (no per-org custom rule leaks
    // into another organization's Policies list).
    const visible = all.filter(policy => !policy.scope.organizationIds?.length || policy.scope.organizationIds.includes(organizationId));
    setPolicies(visible);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const createPolicy = useCallback(
    async (data: Omit<CreatePolicyRequest, "scope"> & { actorId: string }) => {
      const { actorId, ...rest } = data;
      const created = await policyPlatformAPI.createPolicy({ ...rest, scope: { organizationIds: [organizationId] } }, actorId);
      await refresh();
      return created;
    },
    [organizationId, refresh]
  );

  const enablePolicy = useCallback(
    async (id: string, actorId: string) => {
      const updated = await policyPlatformAPI.enablePolicy(id, actorId);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const disablePolicy = useCallback(
    async (id: string, actorId: string) => {
      const updated = await policyPlatformAPI.disablePolicy(id, actorId);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deletePolicy = useCallback(
    async (id: string, actorId: string) => {
      const removed = await policyPlatformAPI.deletePolicy(id, actorId);
      await refresh();
      return removed;
    },
    [refresh]
  );

  return { policies, createPolicy, enablePolicy, disablePolicy, deletePolicy, refresh };
}

export type UsePoliciesResult = ReturnType<typeof usePolicies>;
