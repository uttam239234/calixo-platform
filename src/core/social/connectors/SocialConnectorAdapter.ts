/**
 * Calixo Platform - Social Connector Adapter
 *
 * The Connector Platform's real hookup point for Social Media — reads live connector summaries
 * via `connectorsPlatformAPI` (the same facade Dashboard's `ConnectedPlatforms` and Ads'
 * `AdsConnectorAdapter` use) and, for the one provider this codebase actually seeds with genuine
 * social read/write capability (`instagram` — see Dashboard's `seedDashboardConnections.ts`),
 * replaces that account's demo `status`/`lastSync` with real connector health and flags it
 * `isLiveConnector: true`.
 *
 * `youtube` is ALSO seeded, but deliberately excluded here: its registry definition only grants
 * `read_analytics` (no `read_social`/`write_social`) and its seed status is `"connecting"`, not
 * `"connected"` — it's an ads/analytics connector, not a genuine social publishing connector.
 * Treating it as "live" would be dishonest. Facebook/LinkedIn/X/TikTok/Pinterest/Threads have no
 * seeded connector at all and honestly keep today's demo status.
 *
 * Social Media owns no connector code here: no OAuth, no token refresh, no sync scheduling, no
 * seeding — only ever reads through `connectorsPlatformAPI`.
 */
import { connectorsPlatformAPI } from "@/integrations/platform/ConnectorsPlatformAPI";
import { SOCIAL_ORGANIZATION_ID } from "../tenant/SocialTenantDefaults";
import type { SocialAccountStatus } from "../types";

/** Only the account with a genuinely connected, social-capable seeded connector. */
const PROVIDER_TO_SOCIAL_ACCOUNT: Record<string, string> = {
  instagram: "instagram",
};

function toAccountStatus(status: string): SocialAccountStatus {
  if (status === "connected") return "Connected";
  if (status === "connecting" || status === "pending") return "Needs attention";
  return "Disconnected";
}

export interface SocialLiveConnectorStatus {
  status: SocialAccountStatus;
  lastSync: string;
}

export interface SocialConnectorSyncResult {
  connectedAccountIds: string[];
  demoAccountIds: string[];
  syncedAt: string;
}

let liveStatusByAccountId: Record<string, SocialLiveConnectorStatus> = {};
let lastResult: SocialConnectorSyncResult | null = null;

/** Real connector-backed status for an account id, when one exists — `undefined` means "no live connector, show demo status" (a real, correct state, not an error). */
export function getLiveSocialAccountStatus(accountId: string): SocialLiveConnectorStatus | undefined {
  return liveStatusByAccountId[accountId];
}

export function getLastSocialConnectorSyncResult(): SocialConnectorSyncResult | null {
  return lastResult;
}

/**
 * Pulls real connector summaries for `organizationId` and refreshes the live-status map that
 * `SocialEngine`/`SocialPlatformAPI` consult. Safe to call repeatedly — always re-reads current
 * connector state. If nothing is connected yet, every account falls back to its demo status
 * (today's unchanged default).
 */
export async function syncSocialAccountsFromConnectors(organizationId: string = SOCIAL_ORGANIZATION_ID): Promise<SocialConnectorSyncResult> {
  const connections = await connectorsPlatformAPI.getConnectorSummaries(organizationId);

  const next: Record<string, SocialLiveConnectorStatus> = {};
  const connectedAccountIds: string[] = [];

  for (const connection of connections) {
    const accountId = PROVIDER_TO_SOCIAL_ACCOUNT[connection.providerId];
    if (!accountId) continue;
    if (connection.status === "connected") connectedAccountIds.push(accountId);
    next[accountId] = {
      status: toAccountStatus(connection.status),
      lastSync: connection.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : "Not yet synced",
    };
  }

  liveStatusByAccountId = next;
  const demoAccountIds = Object.values(PROVIDER_TO_SOCIAL_ACCOUNT).filter(id => !connectedAccountIds.includes(id));
  lastResult = { connectedAccountIds, demoAccountIds, syncedAt: new Date().toISOString() };
  return lastResult;
}
