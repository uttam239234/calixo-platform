/**
 * Calixo Platform - Universal Connector Framework: Event Bus
 *
 * NOT a new event bus. The platform already has one sanctioned, real
 * pub/sub mechanism — `platformEventBus` (`@/core/platform/events`), itself
 * a typed wrapper over `@/background/events/EventBus`'s real publish/
 * subscribe/dispatch mechanics. This module is a thin, connector-flavored
 * façade over it: it narrows `publish()` to the brief's 8 named connector
 * events and always stamps the connector-relevant tenant fields
 * (organizationId/workspaceId/connectorInstanceId), so every call site
 * looks the same instead of re-deriving a `PlatformEventInput` by hand.
 *
 * `ConnectorHealthChanged`, `ConnectorSyncCompleted`/`Failed`,
 * `ConnectorConnected`/`Disconnected`, `ConnectorInstalled`/`Uninstalled`,
 * `WebhookReceived` already existed in `PlatformEventType`. Only
 * `ConnectorTokenRefreshed` and `ConnectorPermissionsChanged` were added
 * (additively) to that catalog for this framework.
 */
import { platformEventBus } from "@/core/platform/events";
import type { PlatformEventType } from "@/core/platform/events";
import type { ConnectorProviderId } from "./types";

export interface ConnectorEventTenant {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  connectorInstanceId?: string;
}

function publish(type: PlatformEventType, tenant: ConnectorEventTenant, payload: Record<string, unknown>) {
  return platformEventBus.publish({
    type,
    organizationId: tenant.organizationId,
    workspaceId: tenant.workspaceId,
    userId: tenant.userId,
    payload: { connectorInstanceId: tenant.connectorInstanceId, ...payload },
  });
}

export const connectorEventBus = {
  connectorInstalled: (tenant: ConnectorEventTenant, provider: ConnectorProviderId) => publish("ConnectorInstalled", tenant, { provider }),
  connectorUninstalled: (tenant: ConnectorEventTenant, provider: ConnectorProviderId) => publish("ConnectorUninstalled", tenant, { provider }),
  connectorConnected: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, connectedAccount?: string) => publish("ConnectorConnected", tenant, { provider, connectedAccount }),
  connectorDisconnected: (tenant: ConnectorEventTenant, provider: ConnectorProviderId) => publish("ConnectorDisconnected", tenant, { provider }),
  tokenRefreshed: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, expiresAt?: string) => publish("ConnectorTokenRefreshed", tenant, { provider, expiresAt }),
  syncCompleted: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, recordsProcessed: number) => publish("ConnectorSyncCompleted", tenant, { provider, recordsProcessed }),
  syncFailed: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, error: string) => publish("ConnectorSyncFailed", tenant, { provider, error }),
  healthChanged: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, status: string) => publish("ConnectorHealthChanged", tenant, { provider, status }),
  webhookReceived: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, eventType: string) => publish("WebhookReceived", tenant, { provider, eventType }),
  permissionsChanged: (tenant: ConnectorEventTenant, provider: ConnectorProviderId, scopes: string[]) => publish("ConnectorPermissionsChanged", tenant, { provider, scopes }),

  subscribe: (eventType: PlatformEventType, handlerName: string, description: string, priority?: number) => platformEventBus.subscribe(eventType, handlerName, description, priority),
  registerHandler: (handlerName: string, handler: Parameters<typeof platformEventBus.registerHandler>[1]) => platformEventBus.registerHandler(handlerName, handler),
};
