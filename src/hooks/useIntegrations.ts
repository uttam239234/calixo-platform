"use client";

/**
 * Calixo Integrations - "Connected Apps Center" data hook.
 * The only place allowed to call `connectorPlatformAPI`/`synchronizationPlatformAPI`
 * for this module — components never import them directly. Scoped to a
 * single organization, matching every other Settings module's hook shape
 * (`useWorkspaces`, `useTeams`, ...).
 */

import { useCallback, useEffect, useState } from "react";
import { connectorPlatformAPI, synchronizationPlatformAPI } from "@/core/platform/connectors";
import { connectorObservability } from "@/core/platform/observability";
import type { ConnectorObservabilitySummary } from "@/core/platform/observability";
import { tenantContextService } from "@/core/platform/tenant";
import { connectorRegistry } from "@/integrations/registry/ConnectorRegistry";
import type { Connection, SyncDataType, SyncJob } from "@/integrations/types";
import { getMarketplaceListings, type AppListing } from "@/features/settings/integrations/marketplace";
import { getWorkspacesForConnection, grantWorkspaceAccess, revokeWorkspaceAccess } from "@/features/settings/integrations/workspaceVisibility";
import { recordIntegrationActivity, getIntegrationActivity } from "@/features/settings/integrations/activityLog";
import { iconForApp } from "@/features/settings/integrations/constants";

/** No real login flow exists yet — same fallback convention every module uses locally. */
const DEMO_ACTOR_ID = "user-current";

export interface ConnectedApp {
  connection: Connection;
  icon: string;
  website?: string;
  health?: ConnectorObservabilitySummary;
  workspaceIds: string[];
}

export interface IntegrationActivityItem {
  id: string;
  description: string;
  timestamp: string;
}

/** Priority order for picking a sync data type from a connection's real capabilities — used by "Refresh", which doesn't ask the user to choose one (brief: no technical terminology). */
const DATA_TYPE_BY_CAPABILITY: [string, SyncDataType][] = [
  ["read_analytics", "analytics"], ["write_analytics", "analytics"],
  ["read_campaigns", "campaigns"], ["write_campaigns", "campaigns"],
  ["read_ads", "ads"], ["write_ads", "ads"],
  ["read_social", "social_posts"], ["write_social", "social_posts"],
  ["read_contacts", "contacts"], ["write_contacts", "contacts"],
  ["read_reports", "reports"],
];

function dataTypeFor(connection: Connection): SyncDataType {
  for (const [capability, dataType] of DATA_TYPE_BY_CAPABILITY) {
    if (connection.capabilities.includes(capability as Connection["capabilities"][number])) return dataType;
  }
  return "analytics";
}

export function useIntegrations(organizationId: string) {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [marketplace, setMarketplace] = useState<AppListing[]>([]);
  const [syncJobsByConnection, setSyncJobsByConnection] = useState<Record<string, SyncJob[]>>({});
  const [activity, setActivity] = useState<IntegrationActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const [connections, healthSummaries, listings] = await Promise.all([
      connectorPlatformAPI.getConnections(organizationId),
      connectorObservability.getOrganizationSummary(organizationId),
      getMarketplaceListings(organizationId),
    ]);
    const healthByConnection = new Map<string, ConnectorObservabilitySummary>(healthSummaries.map(h => [h.connectionId, h]));

    const jobsEntries: [string, SyncJob[]][] = await Promise.all(
      connections.map(async (c): Promise<[string, SyncJob[]]> => [c.id, await synchronizationPlatformAPI.getHistory(c.id)])
    );
    const jobsByConnection: Record<string, SyncJob[]> = Object.fromEntries(jobsEntries);

    setApps(
      connections.map(connection => ({
        connection,
        icon: iconForApp(connection.providerId),
        website: connectorRegistry.getDefinition(connection.providerId)?.metadata.website,
        health: healthByConnection.get(connection.id),
        workspaceIds: getWorkspacesForConnection(connection.id),
      }))
    );
    setMarketplace(listings);
    setSyncJobsByConnection(jobsByConnection);

    const connectionById = new Map(connections.map(c => [c.id, c]));
    const syncActivity: IntegrationActivityItem[] = Object.values(jobsByConnection)
      .flat()
      .filter((job: SyncJob) => job.status === "completed" || job.status === "failed")
      .map((job: SyncJob) => {
        const app = connectionById.get(job.connectionId)?.name ?? "An app";
        const description = job.status === "completed" ? `${app} synced — ${job.recordsProcessed} records` : `${app} sync failed`;
        return { id: `sync-${job.id}`, description, timestamp: job.completedAt ?? job.startedAt ?? new Date().toISOString() };
      });
    const loggedActivity: IntegrationActivityItem[] = getIntegrationActivity(organizationId).map(e => ({ id: e.id, description: e.description, timestamp: e.timestamp }));

    setActivity([...loggedActivity, ...syncActivity].sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const withTenantContext = useCallback(() => tenantContextService.resolve({ organizationId, userId: DEMO_ACTOR_ID }), [organizationId]);

  const install = useCallback(
    async (providerId: string, appName: string) => {
      const tenantContext = await withTenantContext();
      const connection = await connectorPlatformAPI.install(tenantContext, providerId, {});
      recordIntegrationActivity(organizationId, `${appName} connected`);
      await refresh();
      return connection;
    },
    [organizationId, withTenantContext, refresh]
  );

  const disconnect = useCallback(
    async (connectionId: string, appName: string) => {
      const tenantContext = await withTenantContext();
      await connectorPlatformAPI.disconnect(tenantContext, connectionId);
      recordIntegrationActivity(organizationId, `${appName} disconnected`);
      await refresh();
    },
    [organizationId, withTenantContext, refresh]
  );

  const reconnect = useCallback(
    async (connectionId: string, appName: string) => {
      const tenantContext = await withTenantContext();
      await connectorPlatformAPI.reconnect(tenantContext, connectionId);
      recordIntegrationActivity(organizationId, `${appName} reconnected`);
      await refresh();
    },
    [organizationId, withTenantContext, refresh]
  );

  const refreshSync = useCallback(
    async (connection: Connection, appName: string) => {
      const job = await synchronizationPlatformAPI.sync(connection.id, dataTypeFor(connection), "incremental");
      recordIntegrationActivity(organizationId, job.status === "completed" ? `${appName} synced — ${job.recordsProcessed} records` : `${appName} sync failed`);
      await refresh();
    },
    [organizationId, refresh]
  );

  const changeAccount = useCallback(
    async (connectionId: string, providerId: string, appName: string) => {
      const tenantContext = await withTenantContext();
      await connectorPlatformAPI.delete(tenantContext, connectionId);
      await connectorPlatformAPI.install(tenantContext, providerId, {});
      recordIntegrationActivity(organizationId, `${appName} account changed`);
      await refresh();
    },
    [organizationId, withTenantContext, refresh]
  );

  const setWorkspaceVisibility = useCallback(
    (connectionId: string, workspaceId: string, visible: boolean) => {
      if (visible) grantWorkspaceAccess(connectionId, workspaceId);
      else revokeWorkspaceAccess(connectionId, workspaceId);
      void refresh();
    },
    [refresh]
  );

  const lookup = useCallback((connectionId: string) => apps.find(a => a.connection.id === connectionId), [apps]);

  return {
    apps,
    marketplace,
    syncJobsByConnection,
    activity,
    loading,
    lookup,
    install,
    disconnect,
    reconnect,
    refreshSync,
    changeAccount,
    setWorkspaceVisibility,
    refresh,
  };
}

export type UseIntegrationsResult = ReturnType<typeof useIntegrations>;
