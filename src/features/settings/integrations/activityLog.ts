/**
 * Calixo Platform - Integrations "Connected Apps Center": Activity Log
 *
 * Section 5 (Activity) needs a simple, readable timeline ("Google Analytics
 * connected", "Meta reconnected") distinct from Audit Logs. A small,
 * additive per-organization event log — the presentation layer's own
 * record of connect/disconnect/reconnect actions, recorded by the hook
 * layer as they happen. Merged with real sync job history
 * (`synchronizationPlatformAPI.getHistory()`) at read time — same
 * two-source pattern as Workspaces' Activity page.
 */

export interface IntegrationActivityEntry {
  id: string;
  organizationId: string;
  description: string;
  timestamp: string;
}

const activityByOrganization = new Map<string, IntegrationActivityEntry[]>();
let counter = 0;

export function recordIntegrationActivity(organizationId: string, description: string): void {
  const entries = activityByOrganization.get(organizationId) ?? [];
  entries.unshift({ id: `integration-activity-${++counter}`, organizationId, description, timestamp: new Date().toISOString() });
  activityByOrganization.set(organizationId, entries.slice(0, 200));
}

export function getIntegrationActivity(organizationId: string): IntegrationActivityEntry[] {
  return activityByOrganization.get(organizationId) ?? [];
}
