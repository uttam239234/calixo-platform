"use client";

/**
 * Calixo Integrations - "Connected Apps Center" data hook.
 * The only place allowed to call the Universal Connector Framework's
 * Server Actions for this module — components never import them directly.
 * Thin: it never knows a provider's OAuth details, it only calls
 * install/buildAuthorizationUrl (real callback route completes the
 * connect)/disconnect/refresh/sync/health.
 */

import { useCallback, useEffect, useState } from "react";
import {
  listConnectorInstancesAction,
  getConnectorDefinitionAction,
  getConnectorHealthForUserAction,
  getConnectorSyncHistoryForUserAction,
  installConnectorAction,
  buildConnectorAuthorizationUrlAction,
  disconnectConnectorAction,
  refreshConnectorAction,
  syncConnectorAction,
} from "@/core/connectors/actions";
import type { ConnectorDefinition, ConnectorHealth, ConnectorInstance, ConnectorSync } from "@/core/connectors/types";
import { entitlementPlatformAPI } from "@/core/platform/commercial";
import { getMarketplaceListings, type AppListing } from "@/features/settings/integrations/marketplace";
import { getWorkspacesForConnection, grantWorkspaceAccess, revokeWorkspaceAccess } from "@/features/settings/integrations/workspaceVisibility";
import { recordIntegrationActivity, getIntegrationActivity } from "@/features/settings/integrations/activityLog";
import { iconForApp } from "@/features/settings/integrations/constants";

export interface ConnectedApp {
  instance: ConnectorInstance;
  definition: ConnectorDefinition;
  icon: string;
  health?: ConnectorHealth;
  lastSync?: ConnectorSync;
  workspaceIds: string[];
}

export interface IntegrationActivityItem {
  id: string;
  description: string;
  timestamp: string;
}

function fallbackDefinition(instance: ConnectorInstance): ConnectorDefinition {
  return {
    id: instance.connectorId,
    provider: instance.provider,
    displayName: instance.displayName,
    category: "productivity",
    icon: "plug",
    version: "0.0.0",
    status: "disabled",
    supportedFeatures: [],
    supportedCapabilities: [],
    requiredOAuthProducts: [],
    requiredScopes: [],
    supportedEvents: [],
    supportsWebhook: false,
    supportsRealtime: false,
    supportsScheduling: false,
    supportsAI: false,
  };
}

export function useIntegrations(organizationId: string) {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [marketplace, setMarketplace] = useState<AppListing[]>([]);
  const [activity, setActivity] = useState<IntegrationActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const [instances, listings] = await Promise.all([listConnectorInstancesAction(), getMarketplaceListings()]);

    const connectedApps: ConnectedApp[] = [];
    const syncActivity: IntegrationActivityItem[] = [];

    await Promise.all(
      instances.map(async instance => {
        const [definition, health, syncHistory] = await Promise.all([
          getConnectorDefinitionAction(instance.connectorId),
          getConnectorHealthForUserAction(instance.id).catch(() => undefined),
          getConnectorSyncHistoryForUserAction(instance.id).catch((): ConnectorSync[] => []),
        ]);
        connectedApps.push({ instance, definition: definition ?? fallbackDefinition(instance), icon: iconForApp(instance.connectorId), health, lastSync: syncHistory[syncHistory.length - 1], workspaceIds: getWorkspacesForConnection(instance.id) });
        for (const sync of syncHistory) {
          if (sync.status !== "succeeded" && sync.status !== "partial" && sync.status !== "failed") continue;
          syncActivity.push({
            id: `sync-${sync.id}`,
            description: sync.status === "failed" ? `${instance.displayName} sync failed` : `${instance.displayName} synced — ${sync.recordsProcessed} record${sync.recordsProcessed === 1 ? "" : "s"}`,
            timestamp: sync.finishedAt ?? sync.startedAt,
          });
        }
      })
    );

    connectedApps.sort((a, b) => a.instance.displayName.localeCompare(b.instance.displayName));
    setApps(connectedApps);
    setMarketplace(listings);

    const loggedActivity: IntegrationActivityItem[] = getIntegrationActivity(organizationId).map(e => ({ id: e.id, description: e.description, timestamp: e.timestamp }));
    setActivity([...loggedActivity, ...syncActivity].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const requireSlot = useCallback(() => {
    const entitlement = entitlementPlatformAPI.canUse({ organizationId, key: "connectorsUsed", requested: 1 });
    if (!entitlement.allowed) throw new Error(entitlement.reason ?? "Upgrade required: your plan's connected-app limit has been reached.");
  }, [organizationId]);

  /** Adds the app without connecting it yet — used by "Starter Integrations" to add several apps in one click; each still needs its own real OAuth consent from Connected Apps. */
  const installOnly = useCallback(
    async (connectorId: string) => {
      requireSlot();
      const instance = await installConnectorAction(connectorId);
      recordIntegrationActivity(organizationId, `${instance.displayName} added — connect it to start syncing`);
      return instance;
    },
    [organizationId, requireSlot]
  );

  /** Installs (if needed) and redirects the browser to the real provider's OAuth consent screen — the only "connect" flow; there is no simulated/demo step. */
  const connect = useCallback(
    async (connectorId: string, appName: string) => {
      const existing = apps.find(a => a.instance.connectorId === connectorId);
      let instance = existing?.instance;
      if (!instance) {
        requireSlot();
        instance = await installConnectorAction(connectorId);
      }
      const { url } = await buildConnectorAuthorizationUrlAction(instance.id);
      recordIntegrationActivity(organizationId, `${appName} connection started`);
      window.location.href = url;
    },
    [organizationId, apps, requireSlot]
  );

  const disconnect = useCallback(
    async (connectorInstanceId: string, appName: string) => {
      await disconnectConnectorAction(connectorInstanceId);
      recordIntegrationActivity(organizationId, `${appName} disconnected`);
      await refresh();
    },
    [organizationId, refresh]
  );

  /** Tries a real, silent token refresh first; only redirects to a fresh OAuth consent screen if that fails (expired/revoked refresh token). */
  const reconnect = useCallback(
    async (connectorInstanceId: string, appName: string) => {
      const result = await refreshConnectorAction(connectorInstanceId);
      if (result.ok) {
        recordIntegrationActivity(organizationId, `${appName} reconnected`);
        await refresh();
        return;
      }
      const { url } = await buildConnectorAuthorizationUrlAction(connectorInstanceId);
      recordIntegrationActivity(organizationId, `${appName} reconnection started`);
      window.location.href = url;
    },
    [organizationId, refresh]
  );

  const refreshSync = useCallback(
    async (connectorInstanceId: string, appName: string) => {
      const sync = await syncConnectorAction(connectorInstanceId, "incremental");
      recordIntegrationActivity(organizationId, sync.status === "succeeded" || sync.status === "partial" ? `${appName} synced — ${sync.recordsProcessed} records` : `${appName} sync failed`);
      await refresh();
    },
    [organizationId, refresh]
  );

  const setWorkspaceVisibility = useCallback(
    (connectorInstanceId: string, workspaceId: string, visible: boolean) => {
      if (visible) grantWorkspaceAccess(connectorInstanceId, workspaceId);
      else revokeWorkspaceAccess(connectorInstanceId, workspaceId);
      void refresh();
    },
    [refresh]
  );

  const lookup = useCallback((connectorInstanceId: string) => apps.find(a => a.instance.id === connectorInstanceId), [apps]);

  return {
    apps,
    marketplace,
    activity,
    loading,
    lookup,
    installOnly,
    connect,
    disconnect,
    reconnect,
    refreshSync,
    setWorkspaceVisibility,
    refresh,
  };
}

export type UseIntegrationsResult = ReturnType<typeof useIntegrations>;
