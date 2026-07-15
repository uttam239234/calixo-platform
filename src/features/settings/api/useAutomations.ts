"use client";

/**
 * Calixo Platform - API & Webhooks - Automations hook
 *
 * The only place allowed to call the Webhook/Developer Platform APIs for
 * "Connected Automations" and "Webhooks" — both Settings tabs are two views
 * over the same real `WebhookConfig` records (friendly cards vs. an
 * explicit WHEN/DO builder), so they share this one hook rather than
 * duplicating CRUD logic.
 */
import { useCallback, useEffect, useState } from "react";
import { developerPlatformAPI } from "@/core/platform/api";
import { webhookPlatformAPI } from "@/core/platform/connectors";
import { connectorsPlatformAPI } from "@/integrations";
import { creditPlatformAPI } from "@/core/platform/commercial";
import type { WebhookConfig, WebhookEvent } from "@/integrations/types";
import type { ConnectorSummary } from "@/core/platform/contracts";
import { generateId } from "@/shared/utils/string";
import { toAutomationCard, type AutomationCard } from "./normalize";

const DEFAULT_RETRY = { maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 30000, backoffMultiplier: 2 };

export interface AutomationInput {
  name: string;
  event: WebhookEvent;
  url: string;
  destinationLabel: string;
  workspaceId?: string;
}

function samplePayload(event: WebhookEvent, organizationId: string): unknown {
  switch (event) {
    case "credits.low": {
      const balance = creditPlatformAPI.getBalance(organizationId, "ai");
      return { creditType: "ai", balance: balance.balance, lifetimeGranted: balance.lifetimeGranted };
    }
    case "report.completed":
      return { reportName: "Weekly Performance Report", completedAt: new Date().toISOString() };
    case "lead.created":
    case "lead.updated":
      return { leadId: generateId(8), source: "Calixo", createdAt: new Date().toISOString() };
    case "contact.created":
    case "contact.updated":
      return { contactId: generateId(8), createdAt: new Date().toISOString() };
    case "form.submitted":
      return { formId: generateId(8), submittedAt: new Date().toISOString() };
    default:
      return { event, triggeredAt: new Date().toISOString() };
  }
}

export function useAutomations(organizationId: string) {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [automations, setAutomations] = useState<AutomationCard[]>([]);
  const [connections, setConnections] = useState<ConnectorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const [configs, summaries] = await Promise.all([developerPlatformAPI.listWebhooks(organizationId), connectorsPlatformAPI.getConnectorSummaries(organizationId)]);
    const cards = await Promise.all(
      configs.map(async config => {
        const deliveries = await webhookPlatformAPI.getDeliveries(config.id);
        return toAutomationCard(config, deliveries[0]);
      })
    );
    setWebhooks(configs);
    setAutomations(cards);
    setConnections(summaries);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const create = useCallback(
    async (input: AutomationInput) => {
      await developerPlatformAPI.registerWebhook(organizationId, {
        url: input.url,
        events: [input.event],
        secret: generateId(32),
        enabled: true,
        retryConfig: DEFAULT_RETRY,
        name: input.name,
        destinationLabel: input.destinationLabel,
        workspaceId: input.workspaceId,
      });
      await refresh();
    },
    [organizationId, refresh]
  );

  const update = useCallback(
    async (id: string, patch: AutomationInput) => {
      await webhookPlatformAPI.update(id, {
        url: patch.url,
        events: [patch.event],
        name: patch.name,
        destinationLabel: patch.destinationLabel,
        workspaceId: patch.workspaceId,
      });
      await refresh();
    },
    [refresh]
  );

  const setEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      await webhookPlatformAPI.update(id, { enabled });
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await webhookPlatformAPI.unregister(id);
      await refresh();
    },
    [refresh]
  );

  const runNow = useCallback(
    async (automation: AutomationCard) => {
      await webhookPlatformAPI.trigger(automation.id, automation.event, samplePayload(automation.event, organizationId));
      await refresh();
    },
    [organizationId, refresh]
  );

  return { webhooks, automations, connections, loading, create, update, setEnabled, remove, runNow, refresh };
}

export type UseAutomationsResult = ReturnType<typeof useAutomations>;
