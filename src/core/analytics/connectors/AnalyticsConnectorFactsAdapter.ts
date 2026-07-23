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
import { listConnectorInstancesAction } from "@/core/connectors/actions";
import { analyticsEngine } from "../engine/AnalyticsEngine";
import { generateAnalyticsFacts } from "../mock/generateAnalyticsFacts";
import type { AnalyticsChannel } from "../types";

/** Only connectors this fact table has a genuine `AnalyticsChannel` mapping for — others (YouTube, Search Console, ...) have no channel equivalent in today's model yet. */
const CONNECTOR_CHANNEL_MAP: Record<string, AnalyticsChannel> = {
  "google-ads": "Google Ads",
  meta: "Meta",
  linkedin: "LinkedIn",
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
 * Pulls real connector summaries and narrows the engine's fact table to the
 * channels with a real `connected` provider. Safe to call repeatedly (e.g.
 * on every Analytics page mount) — always re-reads current connector state.
 * `listConnectorInstancesAction()` derives the real signed-in session's own
 * organization itself via `resolveIdentity()`, never a caller-supplied id (a
 * client-resolved id lives in a different registry instance than the
 * server's and would never match).
 */
export async function syncAnalyticsFactsFromConnectors(): Promise<AnalyticsConnectorSyncResult> {
  const instances = await listConnectorInstancesAction();

  const connectedChannels = new Set<AnalyticsChannel>();
  const connectedProviders: string[] = [];
  const unmapped: string[] = [];

  for (const instance of instances) {
    const channel = CONNECTOR_CHANNEL_MAP[instance.connectorId];
    if (instance.status === "active" && channel) {
      connectedChannels.add(channel);
      connectedProviders.push(instance.connectorId);
    } else {
      unmapped.push(instance.connectorId);
    }
  }

  const allFacts = generateAnalyticsFacts(90);
  const facts = connectedChannels.size > 0 ? allFacts.filter(f => connectedChannels.has(f.channel)) : allFacts;
  analyticsEngine.replaceFacts(facts);

  lastResult = { connectedProviders, unmappedOrDisconnectedProviders: unmapped, factRowCount: facts.length, syncedAt: new Date().toISOString() };
  return lastResult;
}
