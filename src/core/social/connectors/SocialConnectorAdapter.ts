/**
 * Calixo Platform - Social Connector Adapter
 *
 * The Universal Connector Framework's real hookup point for Social Media — reads real
 * `ConnectorInstance`s via `connectorFrameworkAPI` (the same facade Dashboard's `ConnectedPlatforms`
 * and Ads' `AdsConnectorAdapter` use) and, for the connectors that genuinely back a social account
 * (Meta -> Facebook/Instagram, LinkedIn, YouTube), replaces that account's demo `status`/`lastSync`
 * with real connector health and flags it `isLiveConnector: true`. X/TikTok have no real adapter in
 * the framework and honestly keep today's demo status.
 *
 * Social Media owns no connector code here: no OAuth, no token refresh, no sync scheduling, no
 * seeding — only ever reads through `connectorFrameworkAPI`.
 */
import { listConnectorInstancesAction, getConnectorSyncHistoryAction } from "@/core/connectors/actions";
import type { SocialAccountStatus } from "../types";

/** Only accounts with a genuine, registered connector in the Universal Connector Framework — Meta's Graph API covers both Facebook and Instagram, so one "meta" connection backs both accounts. */
const CONNECTOR_TO_SOCIAL_ACCOUNTS: Record<string, string[]> = {
  meta: ["facebook", "instagram"],
  linkedin: ["linkedin"],
  youtube: ["youtube"],
};

function toAccountStatus(status: string): SocialAccountStatus {
  if (status === "active") return "Connected";
  if (status === "paused") return "Needs attention";
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
 * Pulls real connector summaries and refreshes the live-status map that
 * `SocialEngine`/`SocialPlatformAPI` consult. Safe to call repeatedly — always re-reads current
 * connector state. If nothing is connected yet, every account falls back to its demo status
 * (today's unchanged default). The connector actions derive the real signed-in session's own
 * organization themselves via `resolveIdentity()`.
 */
export async function syncSocialAccountsFromConnectors(): Promise<SocialConnectorSyncResult> {
  const instances = await listConnectorInstancesAction();

  const next: Record<string, SocialLiveConnectorStatus> = {};
  const connectedAccountIds: string[] = [];

  for (const instance of instances) {
    const accountIds = CONNECTOR_TO_SOCIAL_ACCOUNTS[instance.connectorId];
    if (!accountIds) continue;
    if (instance.status === "active") connectedAccountIds.push(...accountIds);
    const syncHistory = await getConnectorSyncHistoryAction(instance.id).catch(() => []);
    const lastSync = syncHistory[syncHistory.length - 1];
    for (const accountId of accountIds) {
      next[accountId] = {
        status: toAccountStatus(instance.status),
        lastSync: lastSync?.finishedAt ? new Date(lastSync.finishedAt).toLocaleString() : "Not yet synced",
      };
    }
  }

  liveStatusByAccountId = next;
  const demoAccountIds = Object.values(CONNECTOR_TO_SOCIAL_ACCOUNTS).flat().filter(id => !connectedAccountIds.includes(id));
  lastResult = { connectedAccountIds, demoAccountIds, syncedAt: new Date().toISOString() };
  return lastResult;
}
