"use client";

/**
 * Calixo Platform - API & Webhooks - Activity hook
 *
 * Built entirely from real, already-persisted data — not the background
 * Event Bus (confirmed to have no query/history method, so it can't back a
 * historical feed): real `WebhookDelivery` records across every one of the
 * org's webhooks, plus real API key `createdAt`/`revokedAt` timestamps.
 */
import { useCallback, useEffect, useState } from "react";
import { developerPlatformAPI } from "@/core/platform/api";
import { webhookPlatformAPI } from "@/core/platform/connectors";
import type { ActivityItem } from "@/components/enterprise/module";
import { deliveryToActivity, keyCreatedActivity, keyRevokedActivity, toActivityItems, toAutomationCard, type ApiActivityEntry } from "./normalize";

export function useApiActivity(organizationId: string) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);

    const [webhooks, keys] = await Promise.all([developerPlatformAPI.listWebhooks(organizationId), Promise.resolve(developerPlatformAPI.listApiKeys(organizationId))]);

    const entries: ApiActivityEntry[] = [];
    for (const key of keys) {
      entries.push(keyCreatedActivity(key));
      const revoked = keyRevokedActivity(key);
      if (revoked) entries.push(revoked);
    }

    for (const webhook of webhooks) {
      const deliveries = await webhookPlatformAPI.getDeliveries(webhook.id);
      const automationName = toAutomationCard(webhook).name;
      for (const delivery of deliveries) entries.push(deliveryToActivity(delivery, automationName));
    }

    setItems(toActivityItems(entries));
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  return { items, loading, refresh };
}

export type UseApiActivityResult = ReturnType<typeof useApiActivity>;
