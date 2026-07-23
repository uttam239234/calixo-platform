/**
 * Calixo Platform - Ads Connector Adapter
 *
 * The Universal Connector Framework's real hookup point for Ads Manager — reads real
 * `ConnectorInstance`s via `connectorFrameworkAPI` (the same facade Dashboard's `ConnectedPlatforms`
 * and Analytics' `AnalyticsConnectorFactsAdapter` use) and, for the ad connectors genuinely
 * registered in the framework (`google-ads`, `meta`, `linkedin`), replaces that platform's demo
 * `status`/`lastSync` with real connector health and flags it `isLiveConnector: true`.
 * Microsoft/TikTok/Pinterest have no real adapter in the framework, so they honestly keep today's
 * demo status rather than fake a live connection.
 *
 * Ads Manager owns no connector code here: no OAuth, no token refresh, no sync scheduling, no
 * seeding — this adapter only ever reads through `connectorFrameworkAPI`.
 *
 * Honest limitation: without real third-party OAuth credentials, campaign/spend numbers
 * themselves are still the synthetic mock generator's output — this pipeline only upgrades
 * connection *health*, the same "wiring real, content inert until externally configured"
 * situation the Dashboard and Analytics certification passes documented for their own connector
 * adapters.
 */
import { listConnectorInstancesAction, getConnectorSyncHistoryAction } from "@/core/connectors/actions";
import type { PlatformConnectionStatus } from "../types";

/** Only the ad connectors genuinely registered in the Universal Connector Framework — others have no genuine connection to reflect. */
const CONNECTOR_TO_AD_PLATFORM: Record<string, string> = {
  "google-ads": "google",
  meta: "meta",
  linkedin: "linkedin",
};

function toConnectionStatus(status: string): PlatformConnectionStatus {
  if (status === "active") return "Connected";
  if (status === "paused") return "Syncing";
  return "Attention required";
}

export interface AdsLiveConnectorStatus {
  status: PlatformConnectionStatus;
  lastSync: string;
}

export interface AdsConnectorSyncResult {
  connectedPlatformIds: string[];
  demoPlatformIds: string[];
  syncedAt: string;
}

let liveStatusByPlatformId: Record<string, AdsLiveConnectorStatus> = {};
let lastResult: AdsConnectorSyncResult | null = null;

/** Real connector-backed status for a platform id, when one exists — `undefined` means "no live connector, show demo status" (a real, correct state, not an error). */
export function getLiveAdsPlatformStatus(platformId: string): AdsLiveConnectorStatus | undefined {
  return liveStatusByPlatformId[platformId];
}

export function getLastAdsConnectorSyncResult(): AdsConnectorSyncResult | null {
  return lastResult;
}

/**
 * Pulls real connector summaries and refreshes the live-status map that
 * `computeAdsPlatforms()` consults. Safe to call repeatedly (e.g. on every Ads Manager mount) —
 * always re-reads current connector state. If nothing is connected yet, every platform simply
 * falls back to its demo status (today's unchanged default). The connector actions derive the
 * real signed-in session's own organization themselves via `resolveIdentity()`.
 */
export async function syncAdsPlatformsFromConnectors(): Promise<AdsConnectorSyncResult> {
  const instances = await listConnectorInstancesAction();

  const next: Record<string, AdsLiveConnectorStatus> = {};
  const connectedPlatformIds: string[] = [];

  for (const instance of instances) {
    const platformId = CONNECTOR_TO_AD_PLATFORM[instance.connectorId];
    if (!platformId) continue;
    if (instance.status === "active") connectedPlatformIds.push(platformId);
    const syncHistory = await getConnectorSyncHistoryAction(instance.id).catch(() => []);
    const lastSync = syncHistory[syncHistory.length - 1];
    next[platformId] = {
      status: toConnectionStatus(instance.status),
      lastSync: lastSync?.finishedAt ? new Date(lastSync.finishedAt).toLocaleString() : "Not yet synced",
    };
  }

  liveStatusByPlatformId = next;
  const demoPlatformIds = Object.values(CONNECTOR_TO_AD_PLATFORM).filter(id => !connectedPlatformIds.includes(id));
  lastResult = { connectedPlatformIds, demoPlatformIds, syncedAt: new Date().toISOString() };
  return lastResult;
}
