/**
 * Calixo Platform - Universal Connector Framework: Inbound Webhook Receiver
 *
 * The real HTTP entry point every provider's outbound webhook hits. No
 * generic inbound connector webhook route existed anywhere in this codebase
 * before this (confirmed by research: two other in-repo "webhook" systems
 * had real types but zero HTTP route wired to them) — this is genuinely
 * new. `organizationId` is required as a query param today since this phase
 * doesn't wire per-provider payload parsing to auto-resolve it; a future
 * phase can derive it from the payload once real per-provider parsing
 * exists. Every request — valid or not — is answered in constant shape so a
 * failing signature never leaks which part of the check failed.
 */
import { NextRequest, NextResponse } from "next/server";
import { webhookManager } from "@/core/connectors/WebhookManager";

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string; webhookId: string }> }) {
  const { provider, webhookId } = await params;
  const organizationId = req.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json({ ok: false, message: "Missing organizationId." }, { status: 400 });
  }

  const webhook = await webhookManager.get(organizationId, webhookId);
  if (!webhook || webhook.provider !== provider) {
    return NextResponse.json({ ok: false, message: "Unknown webhook registration." }, { status: 404 });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-calixo-signature");

  const result = await webhookManager.verifyAndReceive({ organizationId, webhookId, rawBody, signatureHeader });
  return NextResponse.json(result, { status: result.ok ? 200 : 401 });
}
