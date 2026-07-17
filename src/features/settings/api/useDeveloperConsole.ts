"use client";

/**
 * Calixo Platform - API & Webhooks - Developer Mode hook
 *
 * "Try It" genuinely calls the real Gateway (`apiGatewayPlatformAPI.handle`)
 * for the two public, unauthenticated contracts — the only two safe to
 * exercise from a UI button. This is also what makes Request Logs and the
 * Rate Limits card show real, non-zero numbers: nothing else in the app
 * issues a real call through the Gateway today.
 */
import { useCallback, useEffect, useState } from "react";
import { apiAnalyticsEngine, apiGatewayPlatformAPI, contractRegistry, openApiPlatformAPI } from "@/core/platform/api";
import type { ApiContractDefinition, ApiRequestRecord, GatewayResponse } from "@/core/platform/api";
import { webhookPlatformAPI } from "@/core/platform/connectors";
import type { WebhookConfig, WebhookDelivery } from "@/integrations/types";

export type TryItPath = "/health" | "/openapi.json";

export function useDeveloperConsole(organizationId: string) {
  const [contracts, setContracts] = useState<ApiContractDefinition[]>([]);
  const [requestLogs, setRequestLogs] = useState<ApiRequestRecord[]>([]);
  const [tryItResult, setTryItResult] = useState<GatewayResponse | null>(null);
  const [tryItLoading, setTryItLoading] = useState(false);
  const [tryItError, setTryItError] = useState<string | null>(null);
  const [redeliverBusyId, setRedeliverBusyId] = useState<string | null>(null);
  const [redeliverError, setRedeliverError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!organizationId) return;
    setContracts(contractRegistry.list());
    setRequestLogs(apiAnalyticsEngine.forOrganizationRecords(organizationId));
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      refresh();
    })();
  }, [refresh]);

  const openApiSpec = useCallback(() => openApiPlatformAPI.generateSpec("v1"), []);

  const tryIt = useCallback(
    async (path: TryItPath) => {
      setTryItLoading(true);
      setTryItError(null);
      try {
        const response = await apiGatewayPlatformAPI.handle({
          method: "GET",
          version: "v1",
          path,
          query: {},
          body: null,
          headers: { "x-organization-id": organizationId },
        });
        setTryItResult(response);
        refresh();
      } catch (error) {
        setTryItError(error instanceof Error ? error.message : "Something went wrong calling the Gateway.");
      } finally {
        setTryItLoading(false);
      }
    },
    [organizationId, refresh]
  );

  const previewPayload = useCallback(async (webhook: WebhookConfig, payload: unknown) => {
    const signature = await webhookPlatformAPI.sign(payload, webhook.secret);
    return { payload, signature };
  }, []);

  const retryHistory = useCallback((webhookId: string): Promise<WebhookDelivery[]> => webhookPlatformAPI.getDeliveries(webhookId), []);

  const redeliver = useCallback(
    async (deliveryId: string) => {
      setRedeliverBusyId(deliveryId);
      setRedeliverError(null);
      try {
        const result = await webhookPlatformAPI.redeliver(deliveryId);
        refresh();
        return result;
      } catch (error) {
        setRedeliverError(error instanceof Error ? error.message : "Something went wrong retrying that delivery.");
        return null;
      } finally {
        setRedeliverBusyId(null);
      }
    },
    [refresh]
  );

  return {
    contracts,
    requestLogs,
    tryItResult,
    tryItLoading,
    tryItError,
    openApiSpec,
    tryIt,
    previewPayload,
    retryHistory,
    redeliver,
    redeliverBusyId,
    redeliverError,
    refresh,
  };
}

export type UseDeveloperConsoleResult = ReturnType<typeof useDeveloperConsole>;
