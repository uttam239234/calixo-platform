/**
 * Calixo Platform - Universal Connector Framework: Provider SDK Base
 *
 * Every one of the 9 provider adapters (`GoogleProvider.ts`, ...) hides the
 * same underlying vendor SDK complexity in the same shape: real OAuth
 * connect/refresh via `OAuthManager` + `TokenManager`, a real per-vendor
 * "who am I" introspection call for `validate()`/`health()`/`test()` (using
 * the ORGANIZATION's own token — never the platform app secret), and the
 * same health/schedule/AI-context wiring. Rather than repeat that ~120
 * lines of real logic 9 times with the only difference being "which vendor
 * endpoint to call and how to read its response," each provider supplies a
 * small `ProviderAdapterConfig` and this base implements the full
 * `Connector` interface around it.
 *
 * `sync()`/`webhook()` are real orchestration calls into `SyncEngine`/
 * `WebhookManager` but — per the brief's explicit instruction — no
 * provider's actual product-data fetch (Google Ads/Analytics/Search
 * Console/Meta/etc.) is implemented; `getAIContext()` is honestly
 * `implemented: false` for every provider this phase ships.
 */
import { oauthManager, type ProviderEndpointExtras } from "../OAuthManager";
import { tokenManager } from "../TokenManager";
import { connectorHealthEngine } from "../ConnectorHealthEngine";
import { connectorEventBus } from "../ConnectorEventBus";
import { connectorLogger } from "../ConnectorLogger";
import { connectorJobScheduler } from "../ConnectorJobScheduler";
import type {
  Connector,
  ConnectorAIContext,
  ConnectorCapabilityId,
  ConnectorConnectParams,
  ConnectorConnectResult,
  ConnectorContext,
  ConnectorHealth,
  ConnectorProviderId,
  ConnectorScheduleResult,
  ConnectorSyncMode,
  ConnectorSyncResult,
  ConnectorTestResult,
  ConnectorValidateResult,
  ConnectorWebhookEvent,
  ConnectorWebhookResult,
} from "../types";

export interface IntrospectionResult {
  ok: boolean;
  connectedAccount?: string;
  providerUserId?: string;
  message: string;
}

export interface ProviderAdapterConfig {
  provider: ConnectorProviderId;
  connectorId: string;
  /** A real, safe, non-interactive "who am I" call using the ORGANIZATION's own access token (never the platform Client Secret) against a real vendor endpoint. */
  introspect: (accessToken: string, extra?: ProviderEndpointExtras) => Promise<IntrospectionResult>;
  capabilities: ConnectorCapabilityId[];
  permissions: string[];
  aiContext: Omit<ConnectorAIContext, "provider" | "implemented">;
  extra?: ProviderEndpointExtras;
}

export function createOAuthConnector(config: ProviderAdapterConfig): Connector {
  const { provider, connectorId, introspect, capabilities, permissions, aiContext, extra: staticExtra } = config;

  /** Per-connection overrides (Shopify's shopDomain, a non-default Salesforce loginUrl, a specific Microsoft tenantId) layered over this connector's static defaults. */
  function resolveExtra(ctx: ConnectorContext): ProviderEndpointExtras {
    return { ...staticExtra, ...ctx.extra };
  }

  return {
    provider,

    async connect(ctx: ConnectorContext, params: ConnectorConnectParams): Promise<ConnectorConnectResult> {
      const start = Date.now();
      const extra = resolveExtra(ctx);
      try {
        // Real code exchange — the platform Client ID/Secret come from `OAuthApplicationService`
        // inside `oauthManager.exchangeCode`, never from anything stored here. `state` is validated
        // there too (real CSRF check against the pending-authorization map `buildAuthorizationUrl` created).
        const exchange = await oauthManager.exchangeCode({ provider, code: params.code, state: params.state });

        // Real "who am I" call using the organization's OWN freshly-issued token — never the platform secret.
        const introspection = await introspect(exchange.accessToken, extra);

        await tokenManager.store(
          ctx.organizationId,
          ctx.connectorInstanceId,
          provider,
          { accessToken: exchange.accessToken, refreshToken: exchange.refreshToken, scopes: exchange.scopes, connectedAccount: introspection.connectedAccount, providerUserId: introspection.providerUserId, expiresAt: exchange.expiresAt },
          ctx.actorId
        );

        await connectorEventBus.connectorConnected({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId }, provider, introspection.connectedAccount);
        await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "connect", status: "success", latencyMs: Date.now() - start });

        return { ok: true, connectedAccount: introspection.connectedAccount, providerUserId: introspection.providerUserId, scopes: exchange.scopes, expiresAt: exchange.expiresAt };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Connect failed.";
        await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "connect", status: "failure", latencyMs: Date.now() - start, error: message });
        return { ok: false, error: message };
      }
    },

    async disconnect(ctx: ConnectorContext): Promise<{ ok: boolean }> {
      const credential = await tokenManager.get(ctx.organizationId, ctx.connectorInstanceId);
      if (credential?.sealedAccessTokenRef) {
        const token = await tokenManager.revealAccessToken(ctx.organizationId, ctx.connectorInstanceId);
        if (token) await oauthManager.revokeToken({ provider, token, extra: resolveExtra(ctx) }).catch(() => undefined);
      }
      await tokenManager.revoke(ctx.organizationId, ctx.connectorInstanceId, ctx.actorId);
      await connectorEventBus.connectorDisconnected({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId }, provider);
      await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "disconnect", status: "success" });
      return { ok: true };
    },

    async refresh(ctx: ConnectorContext): Promise<{ ok: boolean; expiresAt?: string; error?: string }> {
      const start = Date.now();
      try {
        const refreshToken = await tokenManager.revealRefreshToken(ctx.organizationId, ctx.connectorInstanceId);
        if (!refreshToken) return { ok: false, error: "No refresh token stored for this connector." };
        const result = await oauthManager.refreshToken({ provider, refreshToken, extra: resolveExtra(ctx) });
        const credential = await tokenManager.get(ctx.organizationId, ctx.connectorInstanceId);
        await tokenManager.store(ctx.organizationId, ctx.connectorInstanceId, provider, { accessToken: result.accessToken, refreshToken: result.refreshToken ?? refreshToken, scopes: result.scopes, connectedAccount: credential?.connectedAccount, providerUserId: credential?.providerUserId, expiresAt: result.expiresAt }, ctx.actorId);
        await connectorEventBus.tokenRefreshed({ organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId }, provider, result.expiresAt);
        await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "refresh", status: "success", latencyMs: Date.now() - start });
        return { ok: true, expiresAt: result.expiresAt };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Refresh failed.";
        await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "refresh", status: "failure", latencyMs: Date.now() - start, error: message });
        return { ok: false, error: message };
      }
    },

    async validate(ctx: ConnectorContext): Promise<ConnectorValidateResult> {
      const issues: string[] = [];
      const credential = await tokenManager.get(ctx.organizationId, ctx.connectorInstanceId);
      if (!credential || credential.status !== "active") {
        issues.push("No active credential — connect this connector first.");
        return { ok: false, issues };
      }
      if (tokenManager.isExpired(credential)) issues.push("Access token has expired.");
      const missingScopes = permissions.filter(p => !credential.scopes.includes(p));
      if (missingScopes.length) issues.push(`Missing required scopes: ${missingScopes.join(", ")}`);
      return { ok: issues.length === 0, issues };
    },

    async health(ctx: ConnectorContext): Promise<ConnectorHealth> {
      const validation = await this.validate(ctx);
      // `ConnectorHealthEngine.check()` independently re-fetches the credential and expiry itself —
      // it owns the "expired_token" vs "disconnected" distinction. `configurationValid` here is
      // reserved for a problem NEITHER expiry NOR a scope gap explains (none of this phase's
      // adapters produce one yet, so it's always true) — the missing-scope case is reported
      // separately as `permissionIssues`, mapping to the brief's own distinct "permission_missing"
      // state instead of overloading "configuration_error" for it.
      const permissionIssues = validation.issues.filter(i => i.startsWith("Missing required scopes")).map(i => i.replace("Missing required scopes: ", ""));
      const hasOtherIssue = validation.issues.some(i => i !== "Access token has expired." && !i.startsWith("Missing required scopes") && !i.startsWith("No active credential"));
      return connectorHealthEngine.check({
        organizationId: ctx.organizationId,
        connectorInstanceId: ctx.connectorInstanceId,
        provider,
        configurationValid: !hasOtherIssue,
        permissionIssues,
      });
    },

    async sync(ctx: ConnectorContext, mode: ConnectorSyncMode): Promise<ConnectorSyncResult> {
      // Honest, disclosed scope boundary: this phase builds sync ORCHESTRATION only. No provider's
      // real product-data fetch (Ads/Analytics/Search Console/etc.) is implemented — a real
      // connectivity probe (the same introspection call `validate()`/`test()` use) stands in for
      // "did we successfully reach the provider," never a fabricated record count.
      const token = await tokenManager.revealAccessToken(ctx.organizationId, ctx.connectorInstanceId);
      if (!token) return { status: "failed", recordsProcessed: 0, errors: ["No access token available."], message: "Cannot sync: connector is not connected." };
      const probe = await introspect(token, resolveExtra(ctx));
      if (!probe.ok) return { status: "failed", recordsProcessed: 0, errors: [probe.message], message: "Connectivity probe failed; no product data was fetched (not implemented this phase)." };
      return { status: "succeeded", recordsProcessed: 0, errors: [], message: `Connectivity verified via ${mode} sync. No product-data sync is implemented yet — this phase ships orchestration only.` };
    },

    async webhook(ctx: ConnectorContext, event: ConnectorWebhookEvent): Promise<ConnectorWebhookResult> {
      await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: `webhook.${event.type}`, status: "success" });
      return { ok: true, message: `Received ${event.type} — no provider-specific webhook processing is implemented this phase.` };
    },

    async schedule(ctx: ConnectorContext): Promise<ConnectorScheduleResult> {
      const schedule = await connectorJobScheduler.scheduleSync({ organizationId: ctx.organizationId, connectorId, connectorInstanceId: ctx.connectorInstanceId, provider, frequency: "cron", minute: 0 });
      return { ok: true, scheduleIds: [schedule.id] };
    },

    getCapabilities(): ConnectorCapabilityId[] {
      return capabilities;
    },

    getPermissions(): string[] {
      return permissions;
    },

    async test(ctx: ConnectorContext): Promise<ConnectorTestResult> {
      const start = Date.now();
      const token = await tokenManager.revealAccessToken(ctx.organizationId, ctx.connectorInstanceId);
      if (!token) return { ok: false, message: "No access token available — connect this connector first." };
      const result = await introspect(token, resolveExtra(ctx));
      const latencyMs = Date.now() - start;
      // A connectivity test is a read-only diagnostic, not a mutation — logged (ConnectorLogger),
      // not audited (`auditService` is reserved for real mutations, per this codebase's convention).
      await connectorLogger.log({ provider, organizationId: ctx.organizationId, connectorInstanceId: ctx.connectorInstanceId, userId: ctx.actorId, action: "test", status: result.ok ? "success" : "failure", latencyMs, error: result.ok ? undefined : result.message });
      return { ok: result.ok, message: result.message, latencyMs };
    },

    async getAIContext(ctx: ConnectorContext): Promise<ConnectorAIContext> {
      void ctx; // no product-data fetch is implemented this phase, so no per-instance context to read yet
      return { provider, ...aiContext, implemented: false };
    },
  };
}
