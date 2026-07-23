/**
 * Calixo Platform - Universal Connector Framework: Persistence
 *
 * The genuine architectural gap this framework has to fill: EVERY existing
 * "registry" in this codebase (`OrganizationRegistry`, `WorkspaceEngine`,
 * `MainIntegrationService`'s connections, `PersistencePlatformAPI`'s generic
 * `InMemoryRepository`) is one global `Map` holding every organization's rows
 * together, with `organizationId` applied only as a post-hoc filter — and the
 * one real disk-backed store (`PlatformConfigFileStore`) is Platform-Admin
 * config only: one JSON file per TABLE, loaded fully into memory. Neither
 * pattern scales to "100,000+ organizations without architectural changes" —
 * loading every organization's connector instances/credentials/logs into one
 * process-wide Map (or one giant JSON file) at boot is exactly the anti-
 * pattern that breaks at that scale.
 *
 * This store is keyed by (organizationId, table) instead of just (table):
 * one small JSON file per organization per entity type, under
 * `.data/connectors/<organizationId>/<table>.json`. A request for one
 * organization's data touches only that organization's file — never all
 * organizations' data, never a full-table load. Memory/IO cost is O(1) per
 * request, not O(total organizations). No database is reachable in this
 * environment (same disclosed limitation as `PlatformConfigFileStore` — see
 * its own header), so this is a real, durable, atomic-write file substitute;
 * the intended production swap is a sharded/partitioned database table keyed
 * the same way — `get(organizationId, table)` / `list(organizationId, table)`
 * would not need to change shape when that swap happens, which is the actual
 * meaning of "without architectural changes."
 *
 * `import "server-only"`: `fs` doesn't exist in the browser, and every
 * consumer of this module is itself server-only (TokenManager, SyncEngine,
 * ConnectorLogger, etc.).
 */
import "server-only";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { promises as fsp } from "fs";
import path from "path";

export type ConnectorOrgTable =
  | "instances"
  | "credentials"
  | "health"
  | "syncs"
  | "logs"
  | "webhooks"
  | "permissions"
  | "rate_limits";

const DATA_ROOT = path.join(process.cwd(), ".data", "connectors");

function orgDir(organizationId: string): string {
  // organizationId is a real, server-generated id (never raw user input reaching here without
  // having already passed through OrganizationRegistry) — still sanitized defensively since it
  // becomes a filesystem path segment.
  const safe = organizationId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_ROOT, safe);
}

function filePath(organizationId: string, table: ConnectorOrgTable): string {
  return path.join(orgDir(organizationId), `${table}.json`);
}

function ensureOrgDir(organizationId: string): void {
  const dir = orgDir(organizationId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** Reads ONLY this organization's file for this table — never touches any other organization's data. */
export function readOrgTable<T>(organizationId: string, table: ConnectorOrgTable): T | undefined {
  const file = filePath(organizationId, table);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    return undefined;
  }
}

const writeQueues = new Map<string, Promise<void>>();

/** Atomic (temp file + rename) and serialized per (organizationId, table) — two writers touching the SAME organization+table queue; different organizations, or different tables of the same organization, write fully in parallel (no cross-organization contention, unlike a single global table lock). */
export function writeOrgTable<T>(organizationId: string, table: ConnectorOrgTable, data: T): Promise<void> {
  ensureOrgDir(organizationId);
  const key = `${organizationId}:${table}`;
  const previous = writeQueues.get(key) ?? Promise.resolve();
  const next = previous.then(async () => {
    const file = filePath(organizationId, table);
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fsp.rename(tmp, file);
  });
  writeQueues.set(key, next.catch(() => undefined));
  return next;
}

/** Real cross-org listing exists ONLY for Platform Admin diagnostics (small, bounded, explicitly an admin operation — never on any per-request org-scoped code path). Reads each org directory's file individually; still never holds more than one organization's rows in memory at a time. */
export function listAllOrganizationIdsWithConnectorData(): string[] {
  if (!existsSync(DATA_ROOT)) return [];
  try {
    return readdirSync(DATA_ROOT, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch {
    return [];
  }
}
