/**
 * Calixo Platform - Universal Connector Framework: OAuth Manager
 *
 * MUST consume `OAuthApplicationService` — never stores a Client ID or
 * Client Secret itself. Every call below resolves the real platform
 * application (Client ID, Client Secret, Redirect URI, Scopes) via
 * `OAuthApplicationService.getProvider(provider)` first; if that returns
 * `undefined` (the platform app isn't configured/validated yet in
 * Platform Secrets -> OAuth Applications), every operation here fails
 * loudly rather than falling back to a locally-stored credential — there
 * is no local fallback to fall back to, by design.
 *
 * Real per-vendor OAuth2 endpoints (documented, not invented) for all 9
 * providers: authorization URL, token exchange, refresh, and revoke where
 * a vendor actually publishes one (several don't — disclosed via
 * `revokeToken()` returning `{ok:false}` rather than silently no-op'ing).
 */
import "server-only";
import { generateId } from "@/shared/utils/string";
import { OAuthApplicationService } from "@/core/platform/secrets/oauth";
import type { ConnectorProviderId } from "./types";

// ============================================================================
// PKCE + state (transient, in-memory — a real CSRF/replay guard, not durable
// business data; same category of small transient map `IntegrationOAuthService`
// already uses for its own states, and correctly NOT persisted for the same
// reason: a 10-minute-TTL authorization-in-progress record is meaningless
// after a real process restart anyway).
// ============================================================================

interface PendingAuthorization {
  provider: ConnectorProviderId;
  organizationId: string;
  /** Which `ConnectorInstance` this authorization is for — round-tripped through `state` so a real browser OAuth callback (which only ever receives `code`+`state`) knows which instance to complete. */
  connectorInstanceId?: string;
  redirectUri: string;
  codeVerifier?: string;
  extra?: ProviderEndpointExtras;
  createdAt: number;
}

const STATE_TTL_MS = 10 * 60 * 1000;
const pendingAuthorizations = new Map<string, PendingAuthorization>();

function cleanupExpiredStates(): void {
  const now = Date.now();
  for (const [state, entry] of pendingAuthorizations) {
    if (now - entry.createdAt > STATE_TTL_MS) pendingAuthorizations.delete(state);
  }
}

async function base64UrlSha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("base64url");
}

// ============================================================================
// Real, documented per-provider OAuth2 endpoints
// ============================================================================

export interface ProviderEndpointExtras {
  tenantId?: string;
  loginUrl?: string;
  shopDomain?: string;
}

interface ResolvedEndpoints {
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  usesPkce: boolean;
  extraAuthParams: Record<string, string>;
}

function resolveEndpoints(provider: ConnectorProviderId, extra?: ProviderEndpointExtras): ResolvedEndpoints {
  switch (provider) {
    case "google":
      return {
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        revokeUrl: "https://oauth2.googleapis.com/revoke",
        usesPkce: true,
        extraAuthParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
      };
    case "meta":
      return {
        authorizationUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
        usesPkce: false,
        extraAuthParams: {},
      };
    case "linkedin":
      return {
        authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
        tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
        usesPkce: false,
        extraAuthParams: {},
      };
    case "microsoft": {
      const tenant = extra?.tenantId?.trim() || "common";
      return {
        authorizationUrl: `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,
        usesPkce: true,
        extraAuthParams: { response_mode: "query" },
      };
    }
    case "slack":
      return {
        authorizationUrl: "https://slack.com/oauth/v2/authorize",
        tokenUrl: "https://slack.com/api/oauth.v2.access",
        revokeUrl: "https://slack.com/api/auth.revoke",
        usesPkce: false,
        extraAuthParams: {},
      };
    case "hubspot":
      return {
        authorizationUrl: "https://app.hubspot.com/oauth/authorize",
        tokenUrl: "https://api.hubapi.com/oauth/v1/token",
        usesPkce: false,
        extraAuthParams: {},
      };
    case "salesforce": {
      const loginUrl = (extra?.loginUrl?.trim() || "https://login.salesforce.com").replace(/\/$/, "");
      return {
        authorizationUrl: `${loginUrl}/services/oauth2/authorize`,
        tokenUrl: `${loginUrl}/services/oauth2/token`,
        revokeUrl: `${loginUrl}/services/oauth2/revoke`,
        usesPkce: false,
        extraAuthParams: {},
      };
    }
    case "shopify": {
      if (!extra?.shopDomain) throw new Error("Shopify OAuth requires a shop domain, provided at connect time — not part of the platform-level app record.");
      const shop = extra.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return {
        authorizationUrl: `https://${shop}/admin/oauth/authorize`,
        tokenUrl: `https://${shop}/admin/oauth/access_token`,
        usesPkce: false,
        extraAuthParams: {},
      };
    }
    case "wordpress":
      return {
        authorizationUrl: "https://public-api.wordpress.com/oauth2/authorize",
        tokenUrl: "https://public-api.wordpress.com/oauth2/token",
        usesPkce: false,
        extraAuthParams: {},
      };
  }
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export interface AuthorizationUrlResult {
  url: string;
  state: string;
  codeVerifier?: string;
}

export interface TokenExchangeResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes: string[];
  rawTokenType?: string;
}

export const oauthManager = {
  /**
   * Real authorization URL, built from the REAL platform app (Client ID,
   * Scopes) resolved via `OAuthApplicationService` — never a locally-stored
   * value. `origin` (the real request's scheme+host — never a caller-chosen
   * override) is required so `getProvider()` can compute a real, environment-
   * correct Redirect URI (`${origin}${redirectPathHint}`) rather than trust
   * anything persisted. Real CSRF `state` and, where the vendor supports it,
   * a real PKCE S256 `code_challenge` (future-ready per the brief even for
   * vendors that don't require it yet).
   */
  async buildAuthorizationUrl(params: { provider: ConnectorProviderId; organizationId: string; connectorInstanceId?: string; origin: string; extra?: ProviderEndpointExtras }): Promise<AuthorizationUrlResult> {
    cleanupExpiredStates();
    const app = await OAuthApplicationService.getProvider(params.provider, params.origin);
    if (!app) throw new Error(`No configured, validated Platform OAuth Application for "${params.provider}". Configure it in Platform Admin -> Platform Secrets -> OAuth Applications first.`);

    const endpoints = resolveEndpoints(params.provider, params.extra);
    const redirectUri = app.redirectUri;
    const state = generateId(32);
    const codeVerifier = endpoints.usesPkce ? generateId(64) : undefined;

    pendingAuthorizations.set(state, { provider: params.provider, organizationId: params.organizationId, connectorInstanceId: params.connectorInstanceId, redirectUri, codeVerifier, extra: params.extra, createdAt: Date.now() });
    setTimeout(() => pendingAuthorizations.delete(state), STATE_TTL_MS);

    const query = new URLSearchParams({
      client_id: app.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
      scope: app.scopes.join(" "),
      ...endpoints.extraAuthParams,
    });
    if (codeVerifier) {
      query.set("code_challenge", await base64UrlSha256(codeVerifier));
      query.set("code_challenge_method", "S256");
    }

    return { url: `${endpoints.authorizationUrl}?${query.toString()}`, state, codeVerifier };
  },

  /** Validates `state` (real CSRF check) and exchanges the real authorization code for real tokens at the vendor's real token endpoint, using the real platform Client ID/Secret from `OAuthApplicationService` — never re-derived or cached locally. */
  async exchangeCode(params: { provider: ConnectorProviderId; code: string; state: string }): Promise<TokenExchangeResult & { organizationId: string; connectorInstanceId?: string }> {
    cleanupExpiredStates();
    const pending = pendingAuthorizations.get(params.state);
    if (!pending) throw new Error("Invalid or expired OAuth state — the authorization flow must be restarted.");
    if (pending.provider !== params.provider) throw new Error("Provider mismatch between the authorization request and the callback.");
    pendingAuthorizations.delete(params.state);

    const app = await OAuthApplicationService.getProvider(params.provider);
    if (!app) throw new Error(`No configured Platform OAuth Application for "${params.provider}".`);

    const endpoints = resolveEndpoints(params.provider, pending.extra);
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: pending.redirectUri,
      client_id: app.clientId,
      client_secret: app.clientSecret,
    });
    if (pending.codeVerifier) body.set("code_verifier", pending.codeVerifier);

    const response = await fetch(endpoints.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    const data = await safeJson(response);
    if (!response.ok || (!data.access_token && !data.accessToken)) {
      const detail = (data.error_description as string) ?? (data.error as string) ?? (data.message as string) ?? `HTTP ${response.status}`;
      throw new Error(`${params.provider} rejected the code exchange: ${detail}`);
    }

    const expiresIn = (data.expires_in as number) ?? (data.expiresIn as number);
    return {
      organizationId: pending.organizationId,
      connectorInstanceId: pending.connectorInstanceId,
      accessToken: (data.access_token as string) ?? (data.accessToken as string),
      refreshToken: (data.refresh_token as string) ?? undefined,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scopes: typeof data.scope === "string" ? data.scope.split(/[ ,]+/).filter(Boolean) : app.scopes,
      rawTokenType: data.token_type as string | undefined,
    };
  },

  /** Real `grant_type=refresh_token` POST against the vendor's real token endpoint — the platform Client ID/Secret are re-resolved fresh every call, never cached beyond the lifetime of this function call. */
  async refreshToken(params: { provider: ConnectorProviderId; refreshToken: string; extra?: ProviderEndpointExtras }): Promise<TokenExchangeResult> {
    const app = await OAuthApplicationService.getProvider(params.provider);
    if (!app) throw new Error(`No configured Platform OAuth Application for "${params.provider}".`);
    const endpoints = resolveEndpoints(params.provider, params.extra);

    const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: params.refreshToken, client_id: app.clientId, client_secret: app.clientSecret });
    const response = await fetch(endpoints.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    const data = await safeJson(response);
    if (!response.ok || !data.access_token) {
      const detail = (data.error_description as string) ?? (data.error as string) ?? `HTTP ${response.status}`;
      throw new Error(`${params.provider} rejected the token refresh: ${detail}`);
    }

    const expiresIn = data.expires_in as number;
    return {
      accessToken: data.access_token as string,
      refreshToken: (data.refresh_token as string) ?? params.refreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
      scopes: typeof data.scope === "string" ? data.scope.split(/[ ,]+/).filter(Boolean) : app.scopes,
    };
  },

  /** Real revocation where the vendor documents a public endpoint (Google, Slack, Salesforce); honestly reports `{ok:false}` for the others rather than pretending — Meta/LinkedIn/Microsoft/HubSpot/Shopify/WordPress have no standard token-revoke endpoint a platform app can call generically. */
  async revokeToken(params: { provider: ConnectorProviderId; token: string; extra?: ProviderEndpointExtras }): Promise<{ ok: boolean; message: string }> {
    const endpoints = resolveEndpoints(params.provider, params.extra);
    if (!endpoints.revokeUrl) {
      return { ok: false, message: `${params.provider} does not publish a standard token revocation endpoint — disconnect locally instead (the credential is deleted from Calixo either way).` };
    }
    try {
      if (params.provider === "slack") {
        const response = await fetch(endpoints.revokeUrl, { method: "POST", headers: { Authorization: `Bearer ${params.token}` } });
        const data = await safeJson(response);
        return data.ok ? { ok: true, message: "Slack revoked the token." } : { ok: false, message: `Slack rejected revocation: ${(data.error as string) ?? "unknown error"}` };
      }
      const response = await fetch(endpoints.revokeUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: params.token }) });
      if (response.ok) return { ok: true, message: `${params.provider} revoked the token.` };
      const data = await safeJson(response);
      return { ok: false, message: `${params.provider} rejected revocation: ${(data.error_description as string) ?? (data.error as string) ?? `HTTP ${response.status}`}` };
    } catch (err) {
      return { ok: false, message: `Could not reach ${params.provider} to revoke the token: ${err instanceof Error ? err.message : "network error"}` };
    }
  },

  /** Diagnostics-only visibility into in-flight authorizations — never exposes the code verifier or any secret. */
  countPendingAuthorizations(): number {
    cleanupExpiredStates();
    return pendingAuthorizations.size;
  },

  /**
   * Non-consuming lookup used by the real browser OAuth callback route: it
   * only ever receives `code`+`state` from the provider redirect and needs
   * `connectorInstanceId`/`organizationId` BEFORE it can build a
   * `TenantContext` and call `completeConnect()` (which performs the real,
   * state-consuming exchange). Never returns the code verifier.
   */
  peekPendingAuthorization(state: string): { provider: ConnectorProviderId; organizationId: string; connectorInstanceId?: string } | undefined {
    cleanupExpiredStates();
    const pending = pendingAuthorizations.get(state);
    if (!pending) return undefined;
    return { provider: pending.provider, organizationId: pending.organizationId, connectorInstanceId: pending.connectorInstanceId };
  },
};
