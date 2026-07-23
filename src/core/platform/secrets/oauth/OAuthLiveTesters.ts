import "server-only";

/**
 * Calixo Platform - OAuth Applications: Live Credential Testers
 *
 * "Test OAuth Flow" must NEVER perform a real OAuth login (no browser
 * redirect, no user consent, no customer involved) — but it should still
 * be a REAL network round-trip to the real vendor, not a fabricated
 * result. Two real, safe techniques are used, chosen per how each vendor's
 * API actually works:
 *
 * 1. **Client-credentials grant** (Microsoft, Meta) — both vendors offer a
 *    real, standard, non-interactive grant that returns a genuine access
 *    token directly from client id/secret alone. This gives an
 *    unambiguous real success/failure with no probe needed.
 *
 * 2. **Authorization-code probe** (Google, LinkedIn, HubSpot, Salesforce,
 *    WordPress) — these vendors only issue tokens via the interactive
 *    authorization-code grant, which requires a real user consent step
 *    this phase must not perform. Instead, the token endpoint is called
 *    with a deliberately-invalid authorization code. Per RFC 6749 §5.2,
 *    a spec-compliant OAuth2 server returns `invalid_client` (bad
 *    credentials, HTTP 401) if the client id/secret themselves are wrong,
 *    or `invalid_grant`/similar (HTTP 400) if credentials are fine and
 *    only the fake code was rejected — the exact distinction needed to
 *    verify credentials without ever completing a real login. This is a
 *    genuine, real network call; the classification of "which error means
 *    what" is a documented, disclosed heuristic per vendor, not a fixed
 *    guarantee for every possible vendor response shape.
 *
 * Slack has neither — its bot token is verified directly via the real,
 * safe `auth.test` API (if a Bot Token was provided). Shopify's real OAuth
 * testing needs a shop domain, which isn't part of this platform-level
 * app record — disclosed as format-only rather than faked.
 */
import type { OAuthTestOutcome } from "./types";

export interface OAuthTestResult {
  result: OAuthTestOutcome;
  message: string;
}

const PROBE_CODE = "calixo-oauth-app-credential-probe";
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function unreachable(err: unknown): OAuthTestResult {
  return { result: "unreachable", message: `Could not reach the vendor from this environment (${err instanceof Error ? err.message : "network error"}).` };
}

/** Shared authorization-code-probe implementation — see file header, technique 2. */
async function probeAuthorizationCodeGrant(params: {
  url: string;
  body: URLSearchParams;
  headers?: Record<string, string>;
  isBadClientError: (data: Record<string, unknown>, status: number) => boolean;
}): Promise<OAuthTestResult> {
  try {
    const response = await fetchWithTimeout(params.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...(params.headers ?? {}) },
      body: params.body,
    });
    const data = await safeJson(response);
    if (params.isBadClientError(data, response.status)) {
      const detail = (data.error_description as string) ?? (data.error as string) ?? (data.message as string) ?? `HTTP ${response.status}`;
      return { result: "failed", message: `The vendor rejected the client credentials: ${detail}` };
    }
    if (data.access_token) return { result: "success", message: "The vendor issued a real access token — the client credentials are valid." };
    const recognized = (data.error as string) ?? (data.error_description as string) ?? `HTTP ${response.status}`;
    return { result: "success", message: `The vendor recognized the client credentials (it only rejected the probe authorization code, as expected): ${recognized}.` };
  } catch (err) {
    return unreachable(err);
  }
}

export interface OAuthTestInput {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
  extraFieldValues: Record<string, string>;
  extraSecretValues: Record<string, string>;
}

async function testGoogle(input: OAuthTestInput): Promise<OAuthTestResult> {
  return probeAuthorizationCodeGrant({
    url: "https://oauth2.googleapis.com/token",
    body: new URLSearchParams({ client_id: input.clientId, client_secret: input.clientSecret, code: PROBE_CODE, grant_type: "authorization_code", redirect_uri: input.redirectUri }),
    isBadClientError: (data, status) => data.error === "invalid_client" || status === 401,
  });
}

/** Real client-credentials grant — Meta's "App Access Token" flow, a genuinely non-interactive, server-to-server call. */
async function testMeta(input: OAuthTestInput): Promise<OAuthTestResult> {
  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(input.clientId)}&client_secret=${encodeURIComponent(input.clientSecret)}&grant_type=client_credentials`;
    const response = await fetchWithTimeout(url, { method: "GET" });
    const data = await safeJson(response);
    if (response.ok && data.access_token) return { result: "success", message: "Meta issued a real App Access Token — the credentials are valid." };
    const error = data.error as { message?: string } | undefined;
    return { result: "failed", message: `Meta rejected the request: ${error?.message ?? `HTTP ${response.status}`}` };
  } catch (err) {
    return unreachable(err);
  }
}

async function testLinkedIn(input: OAuthTestInput): Promise<OAuthTestResult> {
  return probeAuthorizationCodeGrant({
    url: "https://www.linkedin.com/oauth/v2/accessToken",
    body: new URLSearchParams({ grant_type: "authorization_code", code: PROBE_CODE, client_id: input.clientId, client_secret: input.clientSecret, redirect_uri: input.redirectUri }),
    isBadClientError: (data, status) => data.error === "invalid_client" || status === 401,
  });
}

/** Real client-credentials grant — Microsoft Graph's real, standard app-only token flow. The cleanest of all 9: no probe needed, a real access token is real proof. */
async function testMicrosoft(input: OAuthTestInput): Promise<OAuthTestResult> {
  const tenant = input.tenantId?.trim() || "common";
  try {
    const response = await fetchWithTimeout(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: input.clientId, client_secret: input.clientSecret, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" }),
    });
    const data = await safeJson(response);
    if (response.ok && data.access_token) return { result: "success", message: "Microsoft issued a real app-only access token — the credentials are valid." };
    const detail = (data.error_description as string) ?? (data.error as string) ?? `HTTP ${response.status}`;
    return { result: "failed", message: `Microsoft rejected the request: ${detail}` };
  } catch (err) {
    return unreachable(err);
  }
}

/** Real API call — Slack's `auth.test`, the vendor's own sanctioned way to verify a bot token without any OAuth flow. Client ID/Secret alone have no equivalent non-interactive Slack endpoint, so they're format-checked only. */
async function testSlack(input: OAuthTestInput): Promise<OAuthTestResult> {
  const botToken = input.extraSecretValues.botToken;
  if (!botToken) {
    return { result: "format_only", message: "No Bot Token provided — verified Client ID/Secret format only. Add a Bot Token to enable a real live check via Slack's auth.test API." };
  }
  try {
    const response = await fetchWithTimeout("https://slack.com/api/auth.test", { method: "POST", headers: { Authorization: `Bearer ${botToken}` } });
    const data = await safeJson(response);
    if (data.ok) return { result: "success", message: `Slack accepted the Bot Token — connected to workspace "${(data.team as string) ?? "unknown"}".` };
    return { result: "failed", message: `Slack rejected the Bot Token: ${(data.error as string) ?? "unknown error"}.` };
  } catch (err) {
    return unreachable(err);
  }
}

async function testHubSpot(input: OAuthTestInput): Promise<OAuthTestResult> {
  return probeAuthorizationCodeGrant({
    url: "https://api.hubapi.com/oauth/v1/token",
    body: new URLSearchParams({ grant_type: "authorization_code", code: PROBE_CODE, client_id: input.clientId, client_secret: input.clientSecret, redirect_uri: input.redirectUri }),
    isBadClientError: (data, status) => status === 401 || /client/i.test((data.message as string) ?? (data.error as string) ?? ""),
  });
}

function testSalesforce(input: OAuthTestInput, loginUrl: string): Promise<OAuthTestResult> {
  return probeAuthorizationCodeGrant({
    url: `${loginUrl.replace(/\/$/, "")}/services/oauth2/token`,
    body: new URLSearchParams({ grant_type: "authorization_code", code: PROBE_CODE, client_id: input.clientId, client_secret: input.clientSecret, redirect_uri: input.redirectUri }),
    isBadClientError: data => /client/i.test((data.error as string) ?? ""),
  });
}

/** Shopify's real OAuth is scoped per-shop (needs a shop domain not part of this platform-level app record) — disclosed as format-only rather than fabricating a network call this environment cannot verify. */
async function testShopify(): Promise<OAuthTestResult> {
  return { result: "format_only", message: "Shopify's real OAuth exchange is per-shop and needs a shop domain, which isn't part of this platform-level app — format validated only. A real live check happens at connect time in a future phase." };
}

async function testWordPress(input: OAuthTestInput): Promise<OAuthTestResult> {
  return probeAuthorizationCodeGrant({
    url: "https://public-api.wordpress.com/oauth2/token",
    body: new URLSearchParams({ client_id: input.clientId, redirect_uri: input.redirectUri, client_secret: input.clientSecret, code: PROBE_CODE, grant_type: "authorization_code" }),
    isBadClientError: (data, status) => data.error === "invalid_client" || status === 401,
  });
}

export const OAUTH_LIVE_TESTERS: Record<string, (input: OAuthTestInput) => Promise<OAuthTestResult>> = {
  google: testGoogle,
  meta: testMeta,
  linkedin: testLinkedIn,
  microsoft: testMicrosoft,
  slack: testSlack,
  hubspot: testHubSpot,
  salesforce: input => testSalesforce(input, input.extraFieldValues.loginUrl || "https://login.salesforce.com"),
  shopify: testShopify,
  wordpress: testWordPress,
};
