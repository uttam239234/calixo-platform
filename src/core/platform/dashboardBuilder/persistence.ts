import "server-only";

/**
 * Calixo Platform - Dashboard-Builder File Persistence
 *
 * Round 23 finding: `dashboardLayoutRegistry` (and its Analytics twin) were
 * only ever imported from `"use client"` hooks — the entire layout system
 * lived inside the browser tab's own JS bundle, wiped on every page
 * refresh, with no server round-trip at all. This is the fix: one JSON
 * file per registry, atomic-write + serialized-queue, mirroring
 * `core/platform/configStore/PlatformConfigFileStore.ts`'s proven pattern.
 * `import "server-only"` here (and in every concrete registry singleton
 * that wires this in) makes it a hard build error for a client component
 * to ever import the registry directly again.
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import type { DashboardLayout } from "./types";

const DIR = path.join(process.cwd(), ".data", "widget-layouts");

function filePath(registryKey: string): string {
  return path.join(DIR, `${registryKey}.json`);
}

export function readLayoutsFromDisk<TKey extends string>(registryKey: string): DashboardLayout<TKey>[] | undefined {
  try {
    const raw = fs.readFileSync(filePath(registryKey), "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

const writeQueues = new Map<string, Promise<void>>();

/** Serialized per registry so concurrent saves (e.g. rapid drag events across two tabs) never interleave writes or corrupt the file. */
export function writeLayoutsToDisk<TKey extends string>(registryKey: string, layouts: DashboardLayout<TKey>[]): Promise<void> {
  const prior = writeQueues.get(registryKey) ?? Promise.resolve();
  const next = prior
    .catch(() => {})
    .then(async () => {
      await fsp.mkdir(DIR, { recursive: true });
      const target = filePath(registryKey);
      const tmp = `${target}.${process.pid}.tmp`;
      await fsp.writeFile(tmp, JSON.stringify(layouts, null, 2), "utf-8");
      await fsp.rename(tmp, target);
    });
  writeQueues.set(registryKey, next);
  return next;
}
