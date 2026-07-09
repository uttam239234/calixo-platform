/**
 * Calixo Platform - Ads Connector Adapter
 *
 * The Connector Platform's real hookup point for Ads Manager — reads live connector summaries
 * via `connectorsPlatformAPI` (the same facade Dashboard's `ConnectedPlatforms` and Analytics'
 * `AnalyticsConnectorFactsAdapter` use) and, for the providers this codebase actually seeds
 * (`google-ads`, `meta-ads`, `linkedin-ads` — see Dashboard's `seedDashboardConnections.ts`),
 * replaces that platform's demo `status`/`lastSync` with real connector health and flags it
 * `isLiveConnector: true`. Microsoft/TikTok/Pinterest have no seeded connector in this codebase,
 * so they honestly keep today's demo status rather than fake a live connection.
 *
 * Ads Manager owns no connector code here: no OAuth, no token refresh, no sync scheduling, no
 * seeding. Importing Dashboard's seed function directly would risk a module cycle (Dashboard
 * already depends on Analytics via `analyticsPlatformAPI`, and could plausibly grow an Ads
 * dependency too) — this adapter only ever reads through `connectorsPlatformAPI`.
 *
 * Honest limitation: without real third-party OAuth credentials, campaign/spend numbers
 * themselves are still the synthetic mock generator's output — this pipeline only upgrades
 * connection *health*, the same "wiring real, content inert until externally configured"
 * situation the Dashboard and Analytics certification passes documented for their own connector
 * adapters.
 */
import { connectorsPlatformAPI } from "@/integrations/platform/ConnectorsPlatformAPI";
import { ADS_ORGANIZATION_ID } from "../tenant/AdsTenantDefaults";
import type { PlatformConnectionStatus } from "../types";

/** Only the ad providers this codebase actually seeds a connector for (via Dashboard's demo connections) — others have no genuine connection to reflect. */
const PROVIDER_TO_AD_PLATFORM: Record<string, string> = {
  "google-ads": "google",
  "meta-ads": "meta",
  "linkedin-ads": "linkedin",
};

function toConnectionStatus(status: string): PlatformConnectionStatus {
  if (status === "connected") return "Connected";
  if (status === "connecting" || status === "pending") return "Syncing";
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
 * Pulls real connector summaries for `organizationId` and refreshes the live-status map that
 * `computeAdsPlatforms()` consults. Safe to call repeatedly (e.g. on every Ads Manager mount) —
 * always re-reads current connector state. If nothing is connected yet, every platform simply
 * falls back to its demo status (today's unchanged default).
 */
export async function syncAdsPlatformsFromConnectors(organizationId: string = ADS_ORGANIZATION_ID): Promise<AdsConnectorSyncResult> {
  const connections = await connectorsPlatformAPI.getConnectorSummaries(organizationId);

  const next: Record<string, AdsLiveConnectorStatus> = {};
  const connectedPlatformIds: string[] = [];

  for (const connection of connections) {
    const platformId = PROVIDER_TO_AD_PLATFORM[connection.providerId];
    if (!platformId) continue;
    if (connection.status === "connected") connectedPlatformIds.push(platformId);
    next[platformId] = {
      status: toConnectionStatus(connection.status),
      lastSync: connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : "Not yet synced",
    };
  }

  liveStatusByPlatformId = next;
  const demoPlatformIds = Object.keys(PROVIDER_TO_AD_PLATFORM).map(providerId => PROVIDER_TO_AD_PLATFORM[providerId]).filter(id => !connectedPlatformIds.includes(id));
  lastResult = { connectedPlatformIds, demoPlatformIds, syncedAt: new Date().toISOString() };
  return lastResult;
}
