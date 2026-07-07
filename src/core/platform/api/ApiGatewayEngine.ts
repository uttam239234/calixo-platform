/**
 * Calixo Platform - API Gateway Engine
 *
 * The one real request pipeline every HTTP route in this app runs through:
 * routing -> authentication (reuses Identity's `tokenService`/`ApiKeyService`)
 * -> tenant resolution (reuses `tenantContextService`) -> authorization
 * (reuses `resourceAuthorizationAPI`) -> validation (`SchemaValidator`) ->
 * rate limiting (`RateLimiter`) -> the contract's own handler (which itself
 * only ever calls a Platform API) -> analytics recording. A Next.js route
 * handler's entire job is to call `apiGatewayEngine.handle()` and translate
 * the result to a `Response` — it contains no business logic itself.
 */
import { tokenService } from "@/identity/services/TokenService";
import { tenantContextService } from "../tenant/TenantContextService";
import { resourceAuthorizationAPI } from "../access/ResourceAuthorizationAPI";
import { apiKeyService } from "./ApiKeyService";
import { contractRegistry } from "./ContractRegistry";
import { rateLimiter } from "./RateLimiter";
import { schemaValidator } from "./SchemaValidator";
import { apiAnalyticsEngine } from "./ApiAnalyticsEngine";
import { platformEventBus } from "../events/PlatformEventBus";
import type { AccessToken } from "@/identity/types";
import type { ApiVersion, GatewayAuthMethod, GatewayErrorBody, GatewayRequestContext, GatewayResponse, HttpMethod } from "./types";

export interface RawGatewayRequest {
  method: HttpMethod;
  version: ApiVersion;
  path: string;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
  ip?: string;
}

function errorResponse(status: number, code: string, message: string, details?: unknown): GatewayResponse {
  const body: GatewayErrorBody = { error: { code, message, details } };
  return { status, body, headers: { "content-type": "application/json" } };
}

export class ApiGatewayEngine {
  async handle(request: RawGatewayRequest): Promise<GatewayResponse> {
    const startedAt = Date.now();

    const resolved = contractRegistry.resolve(request.method, request.version, request.path);
    if (!resolved) return errorResponse(404, "not_found", `No contract registered for ${request.method} /${request.version}${request.path}`);

    const { contract, params } = resolved;
    const { definition, handler } = contract;

    if (definition.status === "sunset") {
      return errorResponse(410, "gone", `This endpoint was sunset${definition.migrationNotes ? `: ${definition.migrationNotes}` : "."}`);
    }

    const ctx: GatewayRequestContext = {
      method: request.method,
      path: request.path,
      version: request.version,
      params,
      query: request.query,
      body: request.body,
      headers: request.headers,
      ip: request.ip,
    };

    // --- Authentication ---
    const authResult = await this.authenticate(request.headers);
    if (authResult.error) return authResult.error;
    ctx.userId = authResult.userId;
    ctx.apiKeyId = authResult.apiKeyId;
    ctx.organizationId = authResult.organizationId ?? request.headers["x-organization-id"];
    ctx.workspaceId = request.headers["x-workspace-id"];

    if (definition.visibility !== "public" && authResult.method === "none") {
      return errorResponse(401, "unauthenticated", "This endpoint requires authentication (Bearer token or X-API-Key).");
    }

    // --- Authorization ---
    if (definition.permission) {
      if (!ctx.organizationId) return errorResponse(400, "missing_organization", "X-Organization-Id header is required for this endpoint.");
      if (authResult.apiKeyDefinition && !apiKeyService.hasScope(authResult.apiKeyDefinition, `${definition.permission.resourceType}:${definition.permission.action}`) && !authResult.apiKeyDefinition.scopes.includes("*")) {
        return errorResponse(403, "insufficient_scope", `API key does not have the required scope: ${definition.permission.resourceType}:${definition.permission.action}`);
      }
      if (ctx.userId) {
        const tenantContext = await tenantContextService.resolve({ organizationId: ctx.organizationId, workspaceId: ctx.workspaceId, userId: ctx.userId });
        const decision = await resourceAuthorizationAPI.can(tenantContext, definition.permission.resourceType, definition.permission.action);
        if (!decision.allowed) return errorResponse(403, decision.reasonCode, decision.explanation);
      }
    }

    // --- Validation ---
    if (definition.requestSchema && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH")) {
      const result = schemaValidator.validate(definition.requestSchema, request.body);
      if (!result.valid) return errorResponse(400, "validation_failed", "Request body failed validation.", result.errors);
    }

    // --- Rate Limiting ---
    const rateLimitResult = rateLimiter.check(definition.rateLimits, {
      global: "*",
      endpoint: definition.id,
      organization: ctx.organizationId,
      workspace: ctx.workspaceId,
      user: ctx.userId,
      api_key: ctx.apiKeyId,
      ip: request.ip,
    });
    if (!rateLimitResult.allowed) {
      await platformEventBus.publish({ type: "RateLimitExceeded", organizationId: ctx.organizationId, userId: ctx.userId, payload: { contractId: definition.id, scope: rateLimitResult.rule?.scope } });
      return errorResponse(429, "rate_limited", `Rate limit exceeded for scope '${rateLimitResult.rule?.scope}'. Try again later.`);
    }

    // --- Execute ---
    let response: GatewayResponse;
    try {
      const result = await handler(ctx);
      response = { status: 200, body: result, headers: { "content-type": "application/json" } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal error";
      response = errorResponse(500, "internal_error", message);
    }

    if (definition.status === "deprecated") {
      response.headers["deprecation"] = definition.deprecatedAt ?? "true";
      if (definition.sunsetAt) response.headers["sunset"] = definition.sunsetAt;
    }

    apiAnalyticsEngine.record({
      contractId: definition.id,
      organizationId: ctx.organizationId,
      workspaceId: ctx.workspaceId,
      version: definition.version,
      statusCode: response.status,
      latencyMs: Date.now() - startedAt,
      recordedAt: new Date().toISOString(),
    });

    return response;
  }

  private async authenticate(headers: Record<string, string>): Promise<{
    method: GatewayAuthMethod;
    userId?: string;
    organizationId?: string;
    apiKeyId?: string;
    apiKeyDefinition?: Awaited<ReturnType<typeof apiKeyService.verify>>;
    error?: GatewayResponse;
  }> {
    const apiKeyHeader = headers["x-api-key"];
    if (apiKeyHeader) {
      const definition = await apiKeyService.verify(apiKeyHeader);
      if (!definition) return { method: "api_key", error: errorResponse(401, "invalid_api_key", "The provided API key is invalid, revoked, or expired.") };
      return { method: "api_key", apiKeyId: definition.id, organizationId: definition.organizationId, apiKeyDefinition: definition };
    }

    const authorizationHeader = headers["authorization"];
    if (authorizationHeader?.startsWith("Bearer ")) {
      const token = authorizationHeader.slice("Bearer ".length);
      if (!(await tokenService.verifyToken(token))) {
        return { method: "bearer_jwt", error: errorResponse(401, "invalid_token", "The provided bearer token is invalid or expired.") };
      }
      const payload = tokenService.decodeToken<AccessToken>(token);
      if (!payload?.sub) {
        return { method: "bearer_jwt", error: errorResponse(401, "invalid_token", "Could not decode bearer token.") };
      }
      return { method: "bearer_jwt", userId: payload.sub };
    }

    return { method: "none" };
  }
}

export const apiGatewayEngine = new ApiGatewayEngine();
