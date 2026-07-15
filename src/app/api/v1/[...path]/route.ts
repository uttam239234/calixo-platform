/**
 * Calixo Platform - v1 API Catch-All Route
 *
 * The FIRST real HTTP endpoint this codebase has ever exposed. Deliberately
 * a single catch-all rather than one file per endpoint: routing already
 * belongs to `ContractRegistry.resolve()` (Enterprise API Platform,
 * `core/platform/api`) — duplicating it into per-file Next.js routes would
 * be exactly the "duplicated APIs/middleware" the mandate forbids. This
 * file's entire job is translating a `NextRequest` into the Gateway's
 * generic request shape and back — zero business logic lives here.
 */
import { NextRequest, NextResponse } from "next/server";
import { apiGatewayPlatformAPI, initializePlatformFoundation } from "@/core/platform";
import type { HttpMethod } from "@/core/platform/api/types";
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";

function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => { result[key.toLowerCase()] = value; });
  return result;
}

function queryToObject(searchParams: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => { result[key] = value; });
  return result;
}

async function handle(request: NextRequest, method: HttpMethod, params: { path?: string[] }): Promise<NextResponse> {
  await initializePlatformFoundation();

  let body: unknown = undefined;
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    const text = await request.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: { code: "invalid_json", message: "Request body is not valid JSON." } }, { status: 400 });
      }
    }
  }

  // A real Clerk session (if any) is verified server-side here, never trusted from a client-supplied header — see ApiGatewayEngine's `verifiedUserId`/`verifiedOrganizationId` doc comment. API-key/Bearer machine traffic is unaffected; `resolveIdentity()` simply returns `null` when there's no browser session.
  const identity = await resolveIdentity();

  const result = await apiGatewayPlatformAPI.handle({
    method,
    version: "v1",
    path: `/${(params.path ?? []).join("/")}`,
    query: queryToObject(request.nextUrl.searchParams),
    body,
    headers: headersToObject(request.headers),
    ip: request.headers.get("x-forwarded-for") ?? undefined,
    verifiedUserId: identity?.userId,
    verifiedOrganizationId: identity?.organizationId,
  });

  return NextResponse.json(result.body, { status: result.status, headers: result.headers });
}

type RouteContext = { params: Promise<{ path?: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, "GET", await context.params);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handle(request, "POST", await context.params);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, "PUT", await context.params);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, "PATCH", await context.params);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, "DELETE", await context.params);
}
