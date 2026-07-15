"use client";

/**
 * Calixo Platform - API & Webhooks - API Keys hook
 *
 * Uses the real key-issuance path (`developerPlatformAPI` → `ApiKeyService`,
 * genuine random-secret + SHA-256 hashing, plaintext shown once) — the
 * existing Advanced Settings page bypasses this and never issues a usable
 * secret; this is the first UI to wire the real path.
 */
import { useCallback, useEffect, useState } from "react";
import { developerPlatformAPI, rateLimiter } from "@/core/platform/api";
import type { RateLimitRule, RateLimitCheckResult } from "@/core/platform/api";
import type { ApiKeyDefinition } from "@/core/platform/access/apiAuth/types";

/** Mirrors the actual rule registered on real contracts (`DEFAULT_RATE_LIMITS` in `registerCoreContracts.ts`) — the same key the real Gateway records hits under, read without mutating it. */
const ORGANIZATION_RATE_LIMIT: RateLimitRule = { scope: "organization", limit: 1000, windowMs: 60_000 };

export interface JustIssuedKey {
  name: string;
  plaintextKey: string;
}

/** A render-safe clock — `Date.now()` is impure and may not be called during render, so it's only ever read inside this effect/interval, never inline in JSX. */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setNow(Date.now());
    })();
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** Shared by the Connected Automations landing strip (0-click) and the fuller API Keys card (1 click) — one real read, two display spots. */
export function useOrganizationUsage(organizationId: string) {
  const [usage, setUsage] = useState<RateLimitCheckResult | null>(null);

  const refresh = useCallback(() => {
    if (!organizationId) return;
    setUsage(rateLimiter.peek(ORGANIZATION_RATE_LIMIT, organizationId));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  return { usage, refresh };
}

export function useApiKeys(organizationId: string) {
  const [keys, setKeys] = useState<ApiKeyDefinition[]>([]);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [justIssued, setJustIssued] = useState<JustIssuedKey | null>(null);
  const { usage, refresh: refreshUsage } = useOrganizationUsage(organizationId);

  const refresh = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    setKeys(developerPlatformAPI.listApiKeys(organizationId));
    refreshUsage();
    setLoading(false);
  }, [organizationId, refreshUsage]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const create = useCallback(
    async (name: string, scopes: string[]) => {
      const issued = await developerPlatformAPI.createApiKey(organizationId, name, scopes.length ? scopes : ["*"]);
      setJustIssued({ name: issued.name, plaintextKey: issued.plaintextKey });
      refresh();
      return issued;
    },
    [organizationId, refresh]
  );

  const disable = useCallback(
    async (id: string) => {
      await developerPlatformAPI.revokeApiKey(id, organizationId);
      refresh();
    },
    [organizationId, refresh]
  );

  const rotate = useCallback(
    async (key: ApiKeyDefinition) => {
      await developerPlatformAPI.revokeApiKey(key.id, organizationId);
      const issued = await developerPlatformAPI.createApiKey(organizationId, key.name, key.scopes);
      setJustIssued({ name: issued.name, plaintextKey: issued.plaintextKey });
      refresh();
      return issued;
    },
    [organizationId, refresh]
  );

  const archive = useCallback(
    async (id: string) => {
      const key = keys.find(k => k.id === id);
      if (key?.isActive) await developerPlatformAPI.revokeApiKey(id, organizationId);
      setArchivedIds(prev => new Set(prev).add(id));
      refresh();
    },
    [keys, organizationId, refresh]
  );

  const dismissJustIssued = useCallback(() => setJustIssued(null), []);

  return {
    keys: keys.filter(k => !archivedIds.has(k.id)),
    loading,
    usage,
    justIssued,
    create,
    disable,
    rotate,
    archive,
    dismissJustIssued,
    refresh,
  };
}

export type UseApiKeysResult = ReturnType<typeof useApiKeys>;
