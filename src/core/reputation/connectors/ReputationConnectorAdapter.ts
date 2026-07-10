/**
 * Calixo Platform - Reputation Connector Adapter
 *
 * The Connector Platform's real hookup point for Brand Monitoring — reads live connector
 * summaries via `connectorsPlatformAPI` (the same facade Social's `SocialConnectorAdapter` uses)
 * and, for the one provider this codebase actually seeds with genuine social read capability
 * (`instagram`), reports real connection health for that monitored source. Every other named
 * source in the brief — X, organic Facebook, organic LinkedIn, YouTube, Reddit, News, Blogs,
 * Forums, Review sites — has no seeded connector anywhere in the platform and honestly keeps
 * "demo" status.
 *
 * Brand Monitoring owns no connector code here: no OAuth, no token refresh, no sync scheduling,
 * no crawling engine, no seeding — only ever reads through `connectorsPlatformAPI`.
 */
import { connectorsPlatformAPI } from "@/integrations/platform/ConnectorsPlatformAPI";
import { REPUTATION_ORGANIZATION_ID } from "../tenant/ReputationTenantDefaults";

/** Only the source with a genuinely connected, social-read-capable seeded connector. */
const PROVIDER_TO_SOURCE: Record<string, string> = {
  instagram: "Instagram",
};

export type ReputationSourceStatus = "connected" | "connecting" | "disconnected" | "demo";

export interface ReputationSourceHealth {
  source: string;
  status: ReputationSourceStatus;
  lastSync: string;
  isLiveConnector: boolean;
}

function toSourceStatus(status: string): ReputationSourceStatus {
  if (status === "connected") return "connected";
  if (status === "connecting" || status === "pending") return "connecting";
  return "disconnected";
}

let liveStatusBySource: Record<string, ReputationSourceHealth> = {};

/** Real connector-backed status for a monitored source, when one exists — otherwise the caller should show honest "demo" status, not a fabricated "connected" state. */
export function getLiveReputationSourceStatus(source: string): ReputationSourceHealth | undefined {
  return liveStatusBySource[source];
}

/** All monitored sources with their real-or-demo status, for `BrandSettings`' "Monitored Sources" list. */
export function getReputationSourceStatuses(trackedSources: string[]): ReputationSourceHealth[] {
  return trackedSources.map(source => {
    const live = getLiveReputationSourceStatus(source);
    if (live) return live;
    return { source, status: "demo", lastSync: "Not connected", isLiveConnector: false };
  });
}

/**
 * Pulls real connector summaries for `organizationId` and refreshes the live-status map. Safe to
 * call repeatedly. If nothing is connected yet, every source falls back to demo status.
 */
export async function syncReputationSourcesFromConnectors(organizationId: string = REPUTATION_ORGANIZATION_ID): Promise<void> {
  const connections = await connectorsPlatformAPI.getConnectorSummaries(organizationId);

  const next: Record<string, ReputationSourceHealth> = {};
  for (const connection of connections) {
    const source = PROVIDER_TO_SOURCE[connection.providerId];
    if (!source) continue;
    next[source] = {
      source,
      status: toSourceStatus(connection.status),
      lastSync: connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : "Not yet synced",
      isLiveConnector: connection.status === "connected",
    };
  }
  liveStatusBySource = next;
}
