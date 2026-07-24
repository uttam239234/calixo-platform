/**
 * Calixo Platform - Universal Connector Framework: Real OAuth Callback
 *
 * The real HTTP entry point every provider redirects back to after a
 * Platform Owner-configured Google/Meta/LinkedIn/... consent screen. Only
 * ever receives `code`+`state` (standard OAuth2), so `connectorInstanceId`
 * is recovered via `oauthManager.peekPendingAuthorization(state)` — a
 * non-consuming lookup — before the real, state-consuming
 * `connectorFrameworkAPI.completeConnect()` call. The signed-in Clerk
 * identity (never a client-supplied org id) decides which organization
 * this completes for; a mismatch against the authorization's own
 * organizationId is rejected rather than trusted.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { tenantContextService } from "@/core/platform/tenant";
import { oauthManager } from "@/core/connectors/OAuthManager";
import { connectorFrameworkAPI } from "@/core/connectors/ConnectorFrameworkAPI";
import { getRequestOrigin } from "@/shared/server/requestOrigin";

const INTEGRATIONS_PATH = "/dashboard/settings/integrations";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error") ?? url.searchParams.get("error_description");
  // Same proxy-aware origin resolution the outbound leg already uses
  // (actions.ts -> ConnectorFrameworkAPI.buildAuthorizationUrl -> OAuthManager) —
  // `request.url`'s own origin reflects the raw, possibly proxy-internal Host
  // header, not the browser-facing address.
  const origin = await getRequestOrigin();

  function redirectWithParam(key: string, value: string): NextResponse {
    const target = new URL(INTEGRATIONS_PATH, origin);
    target.searchParams.set(key, value);
    return NextResponse.redirect(target);
  }

  if (providerError) return redirectWithParam("connectError", providerError);
  if (!code || !state) return redirectWithParam("connectError", "The provider did not return an authorization code.");

  const pending = oauthManager.peekPendingAuthorization(state);
  if (!pending || !pending.connectorInstanceId) {
    return redirectWithParam("connectError", "This authorization request expired or was already used. Try connecting again.");
  }

  const identity = await resolveIdentity();
  if (!identity) {
    return NextResponse.redirect(new URL("/sign-in", origin));
  }
  if (identity.organizationId !== pending.organizationId) {
    return redirectWithParam("connectError", "This authorization was started for a different organization.");
  }

  const tenantContext = await tenantContextService.resolve({ organizationId: identity.organizationId, userId: identity.userId });

  try {
    const result = await connectorFrameworkAPI.completeConnect(tenantContext, pending.connectorInstanceId, { code, state });
    if (!result.ok) return redirectWithParam("connectError", result.error ?? "The provider rejected the connection.");
    return redirectWithParam("connected", pending.provider);
  } catch (err) {
    return redirectWithParam("connectError", err instanceof Error ? err.message : "Connection failed.");
  }
}
