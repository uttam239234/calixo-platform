/**
 * Calixo Platform - Reputation Connector Adapter
 *
 * The Universal Connector Framework's real hookup point for Brand Monitoring — reads real
 * `ConnectorInstance`s via `connectorFrameworkAPI` (the same facade Social's `SocialConnectorAdapter`
 * uses) and, for the connectors that genuinely back a monitored source (Meta -> Facebook/Instagram,
 * LinkedIn, YouTube), reports real connection health for that source. Every other named source in
 * the brief — X, Reddit, News, Blogs, Forums, Review sites — has no real adapter in the framework
 * yet and honestly keeps "demo" status.
 *
 * Brand Monitoring owns no connector code here: no OAuth, no token refresh, no sync scheduling,
 * no crawling engine, no seeding — only ever reads through `connectorFrameworkAPI`.
 */
import { listConnectorInstancesAction, getConnectorHealthAction } from "@/core/connectors/actions";

/** Only sources with a genuine, registered connector in the Universal Connector Framework — Meta's Graph API covers both Facebook and Instagram, so one "meta" connection backs both sources. */
const CONNECTOR_TO_SOURCES: Record<string, string[]> = {
  meta: ["Facebook", "Instagram"],
  linkedin: ["LinkedIn"],
  youtube: ["YouTube"],
};

export type ReputationSourceStatus = "connected" | "connecting" | "disconnected" | "demo";

export interface ReputationSourceHealth {
  source: string;
  status: ReputationSourceStatus;
  lastSync: string;
  isLiveConnector: boolean;
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
 * Pulls real connector summaries and refreshes the live-status map. The connector actions derive
 * the real signed-in session's own organization themselves via `resolveIdentity()`. Safe to
 * call repeatedly. If nothing is connected yet, every source falls back to demo status.
 */
export async function syncReputationSourcesFromConnectors(): Promise<void> {
  const instances = await listConnectorInstancesAction();

  const next: Record<string, ReputationSourceHealth> = {};
  for (const instance of instances) {
    const sources = CONNECTOR_TO_SOURCES[instance.connectorId];
    if (!sources) continue;
    const health = await getConnectorHealthAction(instance.id).catch(() => undefined);
    const status: ReputationSourceStatus = instance.status === "active" ? "connected" : instance.status === "error" ? "disconnected" : "connecting";
    for (const source of sources) {
      next[source] = {
        source,
        status,
        lastSync: health?.checkedAt ? new Date(health.checkedAt).toLocaleString() : "Not yet synced",
        isLiveConnector: instance.status === "active",
      };
    }
  }
  liveStatusBySource = next;
}
