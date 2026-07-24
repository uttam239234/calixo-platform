import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Calixo Platform - Prisma Client Singleton
 *
 * The first real PostgreSQL usage in this codebase — every other module
 * persists via file-backed JSON (`.data/`) or in-memory registries. Standard
 * Next.js/Prisma singleton pattern: caching on `globalThis` avoids creating a
 * new `PrismaClient` (and a new connection pool) on every dev hot-reload.
 *
 * Prisma 7 requires an explicit driver adapter (no more implicit
 * connection-string client) — `@prisma/adapter-pg` wraps `pg`, reading the
 * same `DATABASE_URL` every other part of this app already expects.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
