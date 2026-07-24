import "server-only";
import { prisma } from "@/shared/server/prismaClient";
import type { ConnectorProviderId } from "./types";
import type { ProviderEndpointExtras } from "./OAuthManager";

/**
 * Calixo Platform - Universal Connector Framework: Pending OAuth Authorization Store
 *
 * PostgreSQL-backed replacement for the in-memory `Map` previously in
 * `OAuthManager.ts`. A real OAuth authorization-in-progress record must
 * survive between the request that starts the flow (redirects to the
 * provider) and the request that completes it (the provider's callback) —
 * these two requests can land on different server processes/replicas behind
 * a load balancer, or straddle a deploy/restart. An in-memory Map private to
 * one process is invisible to the other; this table is visible to all of
 * them. See `prisma/schema.prisma`'s `PendingOAuthAuthorization` model for
 * why it has no foreign-key relation to Organization/Integration.
 */

export interface PendingOAuthAuthorizationRecord {
  provider: ConnectorProviderId;
  organizationId: string;
  connectorInstanceId?: string;
  redirectUri: string;
  codeVerifier?: string;
  extra?: ProviderEndpointExtras;
}

/**
 * Local stand-in for Prisma's `InputJsonObject` — `ProviderEndpointExtras`
 * (plain named optional-string properties, no index signature) isn't
 * structurally assignable to Prisma's own JSON input type without one, so a
 * cast is unavoidable here; this keeps it a real, narrow JSON-object shape
 * (matching what `ProviderEndpointExtras` actually is) rather than reaching
 * for `any` or a wider recursive JSON type this field never needs.
 */
type JsonObjectValue = { [key: string]: string | number | boolean | null | undefined };

/**
 * Any value that can round-trip through a JSON column — used only to type
 * `PendingOAuthAuthorizationRow.extra` below, structurally mirroring
 * Prisma's own internal `JsonValue`/`JsonObject`/`JsonArray` shape (object
 * values optional via `[key: string]: JsonValue | undefined`) closely enough
 * that TypeScript's structural check accepts Prisma's actual generated Json
 * field type here — without importing that type from `@prisma/client`.
 */
type JsonPrimitive = string | number | boolean | null;
interface JsonObjectShape {
  [key: string]: JsonValue | undefined;
}
type JsonArrayShape = Array<JsonValue>;
type JsonValue = JsonPrimitive | JsonObjectShape | JsonArrayShape;

/**
 * Local row shape — only the fields `rowToRecord()` actually reads.
 * Deliberately NOT imported from `@prisma/client` (a generated model type
 * export has repeatedly failed to resolve on Railway even after removing
 * the `Prisma` namespace import, in a way that doesn't reproduce locally);
 * the real return value of `findUnique`/`delete` below has more fields
 * (`state`, `createdAt`) than this, which is fine — passing a wider object
 * as a function argument only requires these named fields to be present
 * and compatible, not an exact match.
 */
interface PendingOAuthAuthorizationRow {
  provider: string;
  organizationId: string;
  connectorInstanceId: string | null;
  redirectUri: string;
  codeVerifier: string | null;
  extra: JsonValue | null;
}

/** Same 10-minute window the previous in-memory implementation used. */
const STATE_TTL_MS = 10 * 60 * 1000;

function rowToRecord(row: PendingOAuthAuthorizationRow): PendingOAuthAuthorizationRecord {
  return {
    provider: row.provider as ConnectorProviderId,
    organizationId: row.organizationId,
    connectorInstanceId: row.connectorInstanceId ?? undefined,
    redirectUri: row.redirectUri,
    codeVerifier: row.codeVerifier ?? undefined,
    extra: (row.extra ?? undefined) as ProviderEndpointExtras | undefined,
  };
}

export async function savePendingAuthorization(state: string, record: PendingOAuthAuthorizationRecord): Promise<void> {
  await cleanupExpiredPendingAuthorizations();
  await prisma.pendingOAuthAuthorization.create({
    data: {
      state,
      provider: record.provider,
      organizationId: record.organizationId,
      connectorInstanceId: record.connectorInstanceId,
      redirectUri: record.redirectUri,
      codeVerifier: record.codeVerifier,
      extra: record.extra as JsonObjectValue | undefined,
    },
  });
}

/** Non-consuming lookup — mirrors the previous `Map.get()`; never deletes. */
export async function peekPendingAuthorization(state: string): Promise<PendingOAuthAuthorizationRecord | undefined> {
  await cleanupExpiredPendingAuthorizations();
  const row = await prisma.pendingOAuthAuthorization.findUnique({ where: { state } });
  return row ? rowToRecord(row) : undefined;
}

/**
 * Deletes and returns the record in one step. `.delete()` on a primary key is
 * atomic at the database level, so two concurrent callers can never both
 * succeed — the second gets a not-found error and `undefined`, exactly
 * mirroring the single-process `Map.delete()` semantics this replaces, now
 * safe across multiple server instances.
 */
export async function consumePendingAuthorization(state: string): Promise<PendingOAuthAuthorizationRecord | undefined> {
  try {
    const row = await prisma.pendingOAuthAuthorization.delete({ where: { state } });
    return rowToRecord(row);
  } catch {
    return undefined;
  }
}

export async function cleanupExpiredPendingAuthorizations(): Promise<void> {
  await prisma.pendingOAuthAuthorization.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - STATE_TTL_MS) } } });
}

/** Diagnostics-only visibility — same contract as the previous `countPendingAuthorizations()`. */
export async function countPendingAuthorizations(): Promise<number> {
  await cleanupExpiredPendingAuthorizations();
  return prisma.pendingOAuthAuthorization.count();
}
