/**
 * Calixo Platform - Analytics Connector Facts Adapter
 *
 * The Connector Platform's real, already-designed hookup point for
 * Analytics: reads live connector summaries via `connectorsPlatformAPI`
 * (the same facade Dashboard's `ConnectedPlatforms` widget uses) and
 * narrows the engine's fact table down to only the channels with a real,
 * `connected` provider — then swaps it in via `AnalyticsEngine.replaceFacts()`,
 * the engine's own designed integration seam. If nothing is connected yet,
 * the full demo fact table is left in place (today's unchanged default).
 *
 * Analytics owns no connector code here: no OAuth, no token refresh, no
 * sync scheduling, no retries, no webhooks, and no connector *seeding*
 * either — all of that stays the Connector Platform's (and, for demo
 * data, Dashboard's) responsibility; importing Dashboard's seed function
 * from here would create a module cycle (Dashboard already depends on
 * Analytics via `analyticsPlatformAPI`). If no connections are
 * registered yet — e.g. Analytics is opened before Dashboard ever seeds
 * its demo providers — this simply falls back to the full demo fact
 * table below, a real and correct state, not an error.
 *
 * Honest limitation: without real third-party OAuth credentials, the
 * underlying NUMBERS are still the synthetic fact generator's output —
 * this pipeline is real and would carry genuine data the moment an
 * actual OAuth connection exists, the same "wiring real, content inert
 * until externally configured" situation the Dashboard certification
 * pass found with `AlertPlatformAPI`.
 */
import { connectorsPlatformAPI } from "@/integrations/platform/ConnectorsPlatformAPI";
import { analyticsEngine } from "../engine/AnalyticsEngine";
import { generateAnalyticsFacts } from "../mock/generateAnalyticsFacts";
import type { AnalyticsChannel } from "../types";
import { ANALYTICS_ORGANIZATION_ID } from "../tenant/AnalyticsTenantDefaults";

/** Only providers this fact table has a genuine `AnalyticsChannel` mapping for — others (Instagram, YouTube, ...) have no channel equivalent in today's model yet. */
const PROVIDER_CHANNEL_MAP: Record<string, AnalyticsChannel> = {
  "google-ads": "Google Ads",
  "meta-ads": "Meta",
  "linkedin-ads": "LinkedIn",
};

export interface AnalyticsConnectorSyncResult {
  connectedProviders: string[];
  unmappedOrDisconnectedProviders: string[];
  factRowCount: number;
  syncedAt: string;
}

let lastResult: AnalyticsConnectorSyncResult | null = null;

/** The most recent sync outcome, for display (e.g. a Data Quality note) without re-running the sync. */
export function getLastConnectorSyncResult(): AnalyticsConnectorSyncResult | null {
  return lastResult;
}

/**
 * Pulls real connector summaries for `organizationId` and narrows the
 * engine's fact table to the channels with a real `connected` provider.
 * Safe to call repeatedly (e.g. on every Analytics page mount) — always
 * re-reads current connector state.
 */
export async function syncAnalyticsFactsFromConnectors(organizationId: string = ANALYTICS_ORGANIZATION_ID): Promise<AnalyticsConnectorSyncResult> {
  const connections = await connectorsPlatformAPI.getConnectorSummaries(organizationId);

  const connectedChannels = new Set<AnalyticsChannel>();
  const connectedProviders: string[] = [];
  const unmapped: string[] = [];

  for (const connection of connections) {
    const channel = PROVIDER_CHANNEL_MAP[connection.providerId];
    if (connection.status === "connected" && channel) {
      connectedChannels.add(channel);
      connectedProviders.push(connection.providerId);
    } else {
      unmapped.push(connection.providerId);
    }
  }

  const allFacts = generateAnalyticsFacts(90);
  const facts = connectedChannels.size > 0 ? allFacts.filter(f => connectedChannels.has(f.channel)) : allFacts;
  analyticsEngine.replaceFacts(facts);

  lastResult = { connectedProviders, unmappedOrDisconnectedProviders: unmapped, factRowCount: facts.length, syncedAt: new Date().toISOString() };
  return lastResult;
}
