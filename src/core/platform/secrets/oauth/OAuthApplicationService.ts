/**
 * Calixo Platform - OAuth Applications: Service Layer
 *
 * `OAuthApplicationService` is the one real entry point for everything
 * this console does — create/update/delete/validate/test/get/list/
 * maskSecrets — and, critically, `getProvider()`: the exact real hook the
 * brief asks the next phase (the Universal Connector Framework) to call.
 * `getProvider()` is the only method here that ever returns real plaintext
 * — it is server-only and must never be reachable from a Server Action
 * that echoes its result back to a client bundle.
 *
 * Mirrors `PlatformSecretsEngine.ts`'s real patterns exactly: every
 * mutation writes a real `auditService.recordEvent()`, `create`/`update`
 * both resolve to the same real upsert (an OAuth application has exactly
 * one record per provider, pre-seeded as "missing" — there's no real
 * difference between "creating" and "updating" it beyond whether it was
 * configured before, same as `addOrUpdateSecret`).
 */
import "server-only";
import { auditService } from "@/access/audit/AuditService";
import type { AuditEventType } from "@/access/types";
import { userRegistry } from "@/core/users";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "@/features/platform-admin/commitPlanChange";
import { getOAuthProviderDefinition, listOAuthProviderDefinitions } from "./OAuthProviderCatalog";
import { oauthApplicationRegistry } from "./OAuthApplicationRegistry";
import { OAUTH_LIVE_TESTERS } from "./OAuthLiveTesters";
import { GOOGLE_DEFAULT_SERVICE_IDS, GOOGLE_SERVICE_CATALOG } from "./google/GoogleScopeRegistry";
import { GoogleScopeService } from "./google/GoogleScopeService";
import type {
  OAuthActionResult,
  OAuthApplicationInput,
  OAuthApplicationSummary,
  OAuthAuditEntry,
  OAuthProviderId,
  PlatformOAuthApplication,
  ResolvedOAuthProvider,
} from "./types";

const AUDIT_RESOURCE = "platform_oauth_application";

function actorDisplayName(userId?: string): string | undefined {
  if (!userId) return undefined;
  return userRegistry.lookup(userId)?.displayName ?? userId;
}

async function toSummary(record: PlatformOAuthApplication): Promise<OAuthApplicationSummary> {
  const def = getOAuthProviderDefinition(record.provider);
  if (!def) throw new Error(`Unknown OAuth provider: ${record.provider}`);

  const extraFields = await Promise.all(
    def.extraFields.map(async spec => {
      if (spec.kind === "secret") {
        const ref = record.extraSecretRefs[spec.key];
        return { key: spec.key, label: spec.label, kind: spec.kind, placeholder: spec.placeholder, required: spec.required, configured: Boolean(ref) };
      }
      const value = record.extraFieldValues[spec.key];
      return { key: spec.key, label: spec.label, kind: spec.kind, placeholder: spec.placeholder, required: spec.required, value, configured: Boolean(value) };
    })
  );

  // Completion percentage — required fields configured / required fields total, a real (not
  // decorative) proxy for "how ready is this provider for the Connector Framework." redirectUri
  // isn't part of this — it's environment-derived infrastructure, not something to configure.
  let requiredTotal = 2; // clientId + clientSecret always required
  let requiredDone = (record.clientId ? 1 : 0) + (record.sealedClientSecretRef ? 1 : 0);
  if (def.hasProjectId) {
    requiredTotal += 1;
    requiredDone += record.projectId ? 1 : 0;
  }
  if (def.hasTenantId) {
    requiredTotal += 1;
    requiredDone += record.tenantId ? 1 : 0;
  }
  if (def.hasScopes) {
    requiredTotal += 1;
    requiredDone += record.defaultScopes.length > 0 ? 1 : 0;
  }
  for (const spec of def.extraFields) {
    if (!spec.required) continue;
    requiredTotal += 1;
    requiredDone += spec.kind === "secret" ? (record.extraSecretRefs[spec.key] ? 1 : 0) : record.extraFieldValues[spec.key] ? 1 : 0;
  }
  const completionPercent = Math.round((requiredDone / requiredTotal) * 100);

  // Google Scope Manager: a never-saved record (`googleSelectedServices` still `undefined`) shows the
  // recommended default selection so the picker isn't blank on first load; once saved even once, the
  // real persisted selection (including an intentionally empty one) is always respected instead.
  const googleServices =
    record.provider === "google"
      ? (() => {
          const selected = record.googleSelectedServices ?? GOOGLE_DEFAULT_SERVICE_IDS;
          return {
            catalog: GOOGLE_SERVICE_CATALOG.map(s => ({ id: s.id, label: s.label, description: s.description, scopes: s.scopes, defaultSelected: s.defaultSelected })),
            selected,
            generatedScopes: GoogleScopeService.generateScopes(selected),
          };
        })()
      : undefined;

  return {
    provider: record.provider,
    cardTitle: def.cardTitle,
    shortLabel: def.shortLabel,
    description: def.description,
    connectors: def.connectors,
    clientIdLabel: def.clientIdLabel,
    clientSecretLabel: def.clientSecretLabel,
    clientId: record.clientId,
    hasClientSecret: Boolean(record.sealedClientSecretRef),
    hasProjectId: def.hasProjectId,
    projectId: record.projectId,
    hasTenantId: def.hasTenantId,
    tenantId: record.tenantId,
    redirectPathHint: def.redirectPathHint,
    hasScopes: def.hasScopes,
    scopeOptions: def.scopeOptions,
    scopes: record.defaultScopes,
    googleServices,
    extraFields,
    status: record.status,
    completionPercent,
    validatedAt: record.validatedAt,
    validationResult: record.validationResult,
    validationMessage: record.validationMessage,
    testedAt: record.testedAt,
    testResult: record.testResult,
    testMessage: record.testMessage,
    createdAt: record.createdAt,
    createdByName: actorDisplayName(record.createdBy),
    updatedAt: record.updatedAt,
    updatedByName: actorDisplayName(record.updatedBy),
  };
}

async function auditForOAuthChange(actorId: string, provider: OAuthProviderId, eventType: AuditEventType, description: string, changes?: Record<string, unknown>): Promise<void> {
  await auditService.recordEvent({
    organizationId: PLATFORM_ADMIN_ORG_SENTINEL,
    userId: actorId,
    eventType,
    resource: AUDIT_RESOURCE,
    resourceId: provider,
    description,
    changes,
  });
}

export const OAuthApplicationService = {
  async list(): Promise<OAuthApplicationSummary[]> {
    const records = await oauthApplicationRegistry.list();
    return Promise.all(records.map(toSummary));
  },

  async get(provider: OAuthProviderId): Promise<OAuthApplicationSummary | undefined> {
    const record = await oauthApplicationRegistry.get(provider);
    return record ? toSummary(record) : undefined;
  },

  /** Same real upsert as `update()` — see file header for why an OAuth application has no meaningful distinction between "create" and "update." Exposed separately only because the brief names both. */
  async create(provider: OAuthProviderId, input: OAuthApplicationInput, actorId: string): Promise<OAuthActionResult> {
    return upsert(provider, input, actorId);
  },

  async update(provider: OAuthProviderId, input: OAuthApplicationInput, actorId: string): Promise<OAuthActionResult> {
    return upsert(provider, input, actorId);
  },

  async delete(provider: OAuthProviderId, actorId: string): Promise<OAuthActionResult> {
    const def = getOAuthProviderDefinition(provider);
    if (!def) return { ok: false, error: "Unknown OAuth provider." };
    const existing = await oauthApplicationRegistry.get(provider);
    if (existing?.sealedClientSecretRef) oauthApplicationRegistry.vault.revoke(existing.sealedClientSecretRef);
    if (existing?.extraSecretRefs) for (const ref of Object.values(existing.extraSecretRefs)) oauthApplicationRegistry.vault.revoke(ref);

    const record: PlatformOAuthApplication = { id: provider, provider, status: "missing", defaultScopes: [], extraFieldValues: {}, extraSecretRefs: {} };
    await oauthApplicationRegistry.set(record);
    await auditForOAuthChange(actorId, provider, "oauth_application_reset", `${actorDisplayName(actorId) ?? "Someone"} reset the ${def.cardTitle} application.`);
    return { ok: true, summary: await toSummary(record) };
  },

  async validate(provider: OAuthProviderId, actorId: string): Promise<OAuthActionResult> {
    const def = getOAuthProviderDefinition(provider);
    if (!def) return { ok: false, error: "Unknown OAuth provider." };
    const existing = await oauthApplicationRegistry.get(provider);
    if (!existing || existing.status === "missing") return { ok: false, error: "Save this application before validating it." };

    const issues: string[] = [];

    if (!existing.clientId) issues.push(`${def.clientIdLabel} is required.`);
    else {
      const check = def.validateClientId(existing.clientId);
      if (!check.valid) issues.push(check.message);
    }

    if (!existing.sealedClientSecretRef) issues.push(`${def.clientSecretLabel} is required.`);
    else {
      const plaintext = await oauthApplicationRegistry.vault.reveal(existing.sealedClientSecretRef);
      const check = def.validateClientSecret(plaintext);
      if (!check.valid) issues.push(check.message);
    }

    if (def.hasProjectId && !existing.projectId) issues.push("Project ID is required.");
    if (def.hasTenantId && !existing.tenantId) issues.push("Tenant ID is required.");
    if (provider === "google") {
      const scopeCheck = GoogleScopeService.validate(existing.googleSelectedServices ?? []);
      if (!scopeCheck.valid) issues.push(scopeCheck.message);
    } else if (def.hasScopes && existing.defaultScopes.length === 0) {
      issues.push("At least one scope is required.");
    }

    for (const spec of def.extraFields) {
      if (!spec.required) continue;
      if (spec.kind === "secret") {
        const ref = existing.extraSecretRefs[spec.key];
        if (!ref) {
          issues.push(`${spec.label} is required.`);
        } else if (spec.validate) {
          const plaintext = await oauthApplicationRegistry.vault.reveal(ref);
          const check = spec.validate(plaintext);
          if (!check.valid) issues.push(check.message);
        }
      } else {
        const value = existing.extraFieldValues[spec.key];
        if (!value) issues.push(`${spec.label} is required.`);
        else if (spec.validate) {
          const check = spec.validate(value);
          if (!check.valid) issues.push(check.message);
        }
      }
    }

    const valid = issues.length === 0;
    const now = new Date().toISOString();
    const record: PlatformOAuthApplication = {
      ...existing,
      status: valid ? "configured" : "validation_failed",
      validatedAt: now,
      validationResult: valid ? "valid" : "invalid",
      validationMessage: valid ? "All required fields, formats, and scopes look correct." : issues.join(" "),
    };
    await oauthApplicationRegistry.set(record);

    await auditForOAuthChange(
      actorId,
      provider,
      "oauth_application_validated",
      `${actorDisplayName(actorId) ?? "Someone"} validated the ${def.cardTitle} application: ${valid ? "valid" : "invalid"}`,
      { validationResult: valid ? "valid" : "invalid" }
    );

    return { ok: true, summary: await toSummary(record) };
  },

  async test(provider: OAuthProviderId, actorId: string, origin?: string): Promise<OAuthActionResult> {
    const def = getOAuthProviderDefinition(provider);
    if (!def) return { ok: false, error: "Unknown OAuth provider." };
    const existing = await oauthApplicationRegistry.get(provider);
    if (!existing || !existing.clientId || !existing.sealedClientSecretRef) return { ok: false, error: "Save Client ID and Client Secret before testing OAuth." };

    const clientSecret = await oauthApplicationRegistry.vault.reveal(existing.sealedClientSecretRef);
    const extraSecretValues: Record<string, string> = {};
    for (const [key, ref] of Object.entries(existing.extraSecretRefs)) extraSecretValues[key] = await oauthApplicationRegistry.vault.reveal(ref);

    const redirectUri = origin ? `${origin}${def.redirectPathHint}` : "";
    const tester = OAUTH_LIVE_TESTERS[provider];
    const outcome = tester
      ? await tester({ clientId: existing.clientId, clientSecret, redirectUri, tenantId: existing.tenantId, extraFieldValues: existing.extraFieldValues, extraSecretValues })
      : { result: "format_only" as const, message: "Live OAuth testing isn't wired for this provider yet." };

    const now = new Date().toISOString();
    const record: PlatformOAuthApplication = { ...existing, testedAt: now, testResult: outcome.result, testMessage: outcome.message };
    await oauthApplicationRegistry.set(record);

    await auditForOAuthChange(
      actorId,
      provider,
      "oauth_application_tested",
      `${actorDisplayName(actorId) ?? "Someone"} tested OAuth for the ${def.cardTitle} application: ${outcome.result}`,
      { testResult: outcome.result }
    );

    return { ok: true, summary: await toSummary(record) };
  },

  /** Converts a raw persisted record into the client-safe shape — never a plaintext secret or a sealed reference, only presence booleans. Exposed as its own method (not just an internal helper) since the brief names it explicitly as part of the service's public surface. */
  async maskSecrets(provider: OAuthProviderId): Promise<OAuthApplicationSummary | undefined> {
    const record = await oauthApplicationRegistry.get(provider);
    return record ? toSummary(record) : undefined;
  },

  /**
   * THE real hook for the next phase (Universal Connector Framework):
   * `OAuthApplicationService.getProvider("google", origin)` resolves everything a
   * connector needs — Client ID, decrypted Client Secret, Redirect URI,
   * Scopes, Status — in one call. Server-only; the caller must never pass
   * this result back to a client bundle.
   *
   * `origin` is optional and deliberately never falls back to anything —
   * `redirectUri` is computed fresh from it (`${origin}${redirectPathHint}`),
   * never read from storage (see `types.ts`'s `PlatformOAuthApplication` doc
   * comment for why). Callers that always run inside a real HTTP request
   * (building a real authorization URL, live-testing a provider) supply one;
   * `OAuthManager.refreshToken()` — invoked from the Connector Token Refresh
   * Sweep, a scheduled job with no request to derive an origin from — never
   * reads `redirectUri` and correctly omits it, getting back `""`.
   */
  async getProvider(provider: OAuthProviderId, origin?: string): Promise<ResolvedOAuthProvider | undefined> {
    const record = await oauthApplicationRegistry.get(provider);
    if (!record || record.status !== "configured" || !record.clientId || !record.sealedClientSecretRef) return undefined;
    const def = getOAuthProviderDefinition(provider);
    if (!def) return undefined;

    const clientSecret = await oauthApplicationRegistry.vault.reveal(record.sealedClientSecretRef);
    const extraFieldValues = { ...record.extraFieldValues };
    const extraSecretValues: Record<string, string> = {};
    for (const [key, ref] of Object.entries(record.extraSecretRefs)) extraSecretValues[key] = await oauthApplicationRegistry.vault.reveal(ref);

    return {
      provider,
      clientId: record.clientId,
      clientSecret,
      redirectUri: origin ? `${origin}${def.redirectPathHint}` : "",
      scopes: record.defaultScopes,
      status: record.status,
      extraFieldValues,
      extraSecretValues,
    };
  },

  async getAuditLog(provider: OAuthProviderId): Promise<OAuthAuditEntry[]> {
    const page = await auditService.getPaginatedAuditLogs({ organizationId: PLATFORM_ADMIN_ORG_SENTINEL, limit: 500 });
    return page.data
      .filter(e => e.resource === AUDIT_RESOURCE && e.resourceId === provider)
      .map(e => ({ id: e.id, eventType: e.eventType, description: e.description, userId: e.userId, userName: actorDisplayName(e.userId), timestamp: e.timestamp, changes: e.changes }));
  },
};

async function upsert(provider: OAuthProviderId, input: OAuthApplicationInput, actorId: string): Promise<OAuthActionResult> {
  const def = getOAuthProviderDefinition(provider);
  if (!def) return { ok: false, error: "Unknown OAuth provider." };
  if (!input.clientId.trim()) return { ok: false, error: `${def.clientIdLabel} is required.` };

  const existing = await oauthApplicationRegistry.get(provider);
  const wasConfigured = existing?.status === "configured";

  let sealedClientSecretRef = existing?.sealedClientSecretRef;
  if (input.clientSecret?.trim()) {
    if (existing?.sealedClientSecretRef) oauthApplicationRegistry.vault.revoke(existing.sealedClientSecretRef);
    sealedClientSecretRef = await oauthApplicationRegistry.vault.seal(input.clientSecret.trim());
  }
  if (!sealedClientSecretRef) return { ok: false, error: `${def.clientSecretLabel} is required.` };

  const extraSecretRefs: Record<string, string> = { ...existing?.extraSecretRefs };
  for (const spec of def.extraFields) {
    if (spec.kind !== "secret") continue;
    const plaintext = input.extraSecretValues[spec.key];
    if (plaintext?.trim()) {
      const priorRef = extraSecretRefs[spec.key];
      if (priorRef) oauthApplicationRegistry.vault.revoke(priorRef);
      extraSecretRefs[spec.key] = await oauthApplicationRegistry.vault.seal(plaintext.trim());
    }
  }

  const extraFieldValues: Record<string, string> = { ...existing?.extraFieldValues };
  for (const spec of def.extraFields) {
    if (spec.kind !== "plain") continue;
    const value = input.extraFieldValues[spec.key];
    if (value?.trim()) extraFieldValues[spec.key] = value.trim();
  }

  // Google Scope Manager: the server is the ONLY place scopes are ever generated. Even if a caller
  // sent raw `input.scopes`, they are ignored for Google — real scopes come exclusively from
  // `GoogleScopeService.generateScopes()` over a sanitized (catalog-checked) service selection.
  let defaultScopes: string[];
  let googleSelectedServices: string[] | undefined;
  if (provider === "google") {
    googleSelectedServices = GoogleScopeService.getSelectedServices(input.googleSelectedServices ?? []);
    defaultScopes = GoogleScopeService.generateScopes(googleSelectedServices);
  } else {
    defaultScopes = input.scopes.length > 0 ? input.scopes : existing?.defaultScopes ?? [];
  }

  const now = new Date().toISOString();
  const record: PlatformOAuthApplication = {
    id: provider,
    provider,
    clientId: input.clientId.trim(),
    sealedClientSecretRef,
    projectId: input.projectId?.trim() || existing?.projectId,
    tenantId: input.tenantId?.trim() || existing?.tenantId,
    defaultScopes,
    googleSelectedServices: provider === "google" ? googleSelectedServices : existing?.googleSelectedServices,
    extraFieldValues,
    extraSecretRefs,
    status: "configured",
    validatedAt: undefined,
    validationResult: undefined,
    validationMessage: undefined,
    testedAt: undefined,
    testResult: undefined,
    testMessage: undefined,
    createdBy: existing?.createdBy ?? actorId,
    createdAt: existing?.createdAt ?? now,
    updatedBy: actorId,
    updatedAt: now,
  };
  await oauthApplicationRegistry.set(record);

  const actionVerb = wasConfigured ? "updated" : "configured";
  const description =
    provider === "google"
      ? `${actorDisplayName(actorId) ?? "Someone"} ${actionVerb} the ${def.cardTitle} application (${googleSelectedServices!.length} Google service${googleSelectedServices!.length === 1 ? "" : "s"} selected, ${defaultScopes.length} scope${defaultScopes.length === 1 ? "" : "s"} generated).`
      : `${actorDisplayName(actorId) ?? "Someone"} ${actionVerb} the ${def.cardTitle} application.`;

  await auditForOAuthChange(actorId, provider, wasConfigured ? "oauth_application_updated" : "oauth_application_created", description);

  return { ok: true, summary: await toSummary(record) };
}

export { listOAuthProviderDefinitions };
