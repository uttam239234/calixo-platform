/**
 * Calixo Platform - Platform Configuration Store: File-Backed Persistence
 *
 * The one REAL disk-writing layer in this codebase (every other "registry"
 * anywhere in `core/` is an in-memory `Map`, seeded fresh on every process/
 * tab start — see the Round 20 persistence investigation report). No
 * database connection is reachable in this environment (`DATABASE_URL` in
 * `.env` is Prisma's own unfilled placeholder, `postgresql://johndoe:
 * randompassword@localhost:5432/mydb`, and `prisma/migrations/` has never
 * been run) — a real Postgres-backed `platform_*` table set is the intended
 * end state (see `prisma/schema.prisma`'s comment header), but connecting to
 * one isn't possible from here. This is a genuinely durable substitute: one
 * JSON file per table under `.data/platform-config/`, on the Next.js
 * server's own local disk, surviving both a browser refresh AND a real
 * `next dev`/`next start` process restart (verified, not assumed — see the
 * certification report).
 *
 * `import "server-only"` is deliberate: this file must never reach a client
 * bundle (`fs` doesn't exist in the browser). Every caller either runs
 * server-side outright, or reaches this file only through a `typeof window
 * === "undefined"`-guarded dynamic `import()` (see `hydrate.ts`) — so the
 * chunk this compiles into is never evaluated in the browser even if a
 * bundler includes it as a lazy chunk.
 */
import "server-only";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { promises as fsp } from "fs";
import path from "path";
import type { PlatformConfigTable } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data", "platform-config");

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(table: PlatformConfigTable): string {
  return path.join(DATA_DIR, `${table}.json`);
}

/** Synchronous — called once at process-boot hydration time, an acceptable one-time cost, and keeps `serverHydrate.ts` a plain synchronous function like the `initializeXFoundation()` calls it runs alongside. */
export function readTable<T>(table: PlatformConfigTable): T | undefined {
  ensureDir();
  const file = filePath(table);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as T;
  } catch {
    // A partially-written or corrupt file (e.g. a crash mid-write before the atomic rename below was added) — treat as absent rather than crash the whole platform's boot.
    return undefined;
  }
}

const writeQueues = new Map<PlatformConfigTable, Promise<void>>();

/**
 * Atomic (write to a temp file, then rename over the real one — a rename is
 * a single filesystem operation, so a reader never observes a half-written
 * file) and serialized per table via a promise chain — the brief's
 * "multi-admin safe updates": two admins saving the same table concurrently
 * queue one after the other rather than interleave writes and corrupt the
 * file. Different tables write fully in parallel.
 */
export function writeTable<T>(table: PlatformConfigTable, data: T): Promise<void> {
  ensureDir();
  const previous = writeQueues.get(table) ?? Promise.resolve();
  const next = previous.then(async () => {
    const file = filePath(table);
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fsp.rename(tmp, file);
  });
  // Swallow so one failed write doesn't wedge the queue for the next caller; the failure itself still propagates to whoever awaited `next`.
  writeQueues.set(table, next.catch(() => undefined));
  return next;
}
