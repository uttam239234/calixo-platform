/**
 * Calixo Platform - Versioning Platform
 *
 * Snapshot/history/restore/compare for any entity, keyed by
 * `${entityType}:${entityId}`. Real, in-memory, testable — genuinely stores
 * a new snapshot on every `EntityManager` create/update rather than only
 * tracking a `version` counter.
 */
import { platformEventBus } from "../events/PlatformEventBus";
import type { VersionSnapshot } from "./types";

export interface VersionDiff {
  field: string;
  before: unknown;
  after: unknown;
}

export class VersioningEngine {
  private history = new Map<string, VersionSnapshot[]>();

  private key(entityType: string, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  async snapshot(entityType: string, entityId: string, data: unknown, recordedBy?: string, label?: string): Promise<VersionSnapshot> {
    const key = this.key(entityType, entityId);
    const existing = this.history.get(key) ?? [];
    const version = existing.length + 1;
    const entry: VersionSnapshot = {
      entityType,
      entityId,
      version,
      data: JSON.parse(JSON.stringify(data)),
      recordedAt: new Date().toISOString(),
      recordedBy,
      label,
    };
    this.history.set(key, [...existing, entry]);

    await platformEventBus.publish({
      type: "EntityVersionCreated",
      userId: recordedBy,
      payload: { entityType, entityId, version },
    });
    return entry;
  }

  getHistory(entityType: string, entityId: string): VersionSnapshot[] {
    return this.history.get(this.key(entityType, entityId)) ?? [];
  }

  getVersion(entityType: string, entityId: string, version: number): VersionSnapshot | undefined {
    return this.getHistory(entityType, entityId).find(v => v.version === version);
  }

  /** Field-level diff between two recorded versions — for "Compare" in the mandate. */
  compare(entityType: string, entityId: string, versionA: number, versionB: number): VersionDiff[] {
    const a = this.getVersion(entityType, entityId, versionA);
    const b = this.getVersion(entityType, entityId, versionB);
    if (!a || !b) return [];

    const aData = a.data as Record<string, unknown>;
    const bData = b.data as Record<string, unknown>;
    const fields = new Set([...Object.keys(aData), ...Object.keys(bData)]);
    const diffs: VersionDiff[] = [];
    for (const field of fields) {
      if (JSON.stringify(aData[field]) !== JSON.stringify(bData[field])) {
        diffs.push({ field, before: aData[field], after: bData[field] });
      }
    }
    return diffs;
  }

  /** Returns the historical snapshot's data — caller (`EntityManager`/`PersistencePlatformAPI`) decides whether/how to write it back via a normal `update()` call, keeping "restore" a normal audited write rather than a silent bypass. */
  getSnapshotForRestore(entityType: string, entityId: string, version: number): unknown | undefined {
    return this.getVersion(entityType, entityId, version)?.data;
  }

  count(): number {
    let total = 0;
    for (const entries of this.history.values()) total += entries.length;
    return total;
  }
}

export const versioningEngine = new VersioningEngine();
