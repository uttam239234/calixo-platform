/**
 * Calixo Platform - Core Contract Registration
 *
 * The one file allowed to import multiple Platform APIs (Organizations,
 * Connector Marketplace, Developer Platform, this package's own
 * OpenAPI/Health) purely to register them as real, gateway-routed
 * contracts (mirroring `registerAllPlatformRegistries.ts`'s "one file,
 * sideways imports" convention). Every handler below calls ONLY a Platform
 * API method — never a repository, never a business module's internals —
 * proving "business modules must never expose APIs directly."
 */
import { contractRegistry } from "../ContractRegistry";
import { apiMonitoring } from "../ApiMonitoring";
import { openApiPlatformAPI } from "../OpenApiPlatformAPI";
import { developerPlatformAPI } from "../DeveloperPlatformAPI";
import { organizationEngine } from "../../organizations/OrganizationEngine";
import { organizationRegistry } from "../../organizations/OrganizationRegistry";
import { connectorMarketplaceAPI } from "../../connectors/ConnectorMarketplaceAPI";
import type { ApiContractDefinition, ContractHandler } from "../types";

const DEFAULT_RATE_LIMITS: ApiContractDefinition["rateLimits"] = [
  { scope: "ip", limit: 100, windowMs: 60_000 },
  { scope: "organization", limit: 1000, windowMs: 60_000 },
];

let registered = false;

export function registerCoreContracts(): void {
  if (registered) return;
  registered = true;

  register(
    {
      id: "health.get",
      name: "Get API Health",
      description: "Returns the Gateway's health, registered endpoint count, and request volume/error-rate.",
      method: "GET",
      path: "/health",
      version: "v1",
      visibility: "public",
      status: "active",
      tags: ["monitoring"],
      owner: "platform-team",
      scopes: [],
      rateLimits: [{ scope: "ip", limit: 60, windowMs: 60_000 }],
    },
    async () => apiMonitoring.getHealth()
  );

  register(
    {
      id: "openapi.get",
      name: "Get OpenAPI Specification",
      description: "Returns the auto-generated OpenAPI 3.0 document for v1.",
      method: "GET",
      path: "/openapi.json",
      version: "v1",
      visibility: "public",
      status: "active",
      tags: ["documentation"],
      owner: "platform-team",
      scopes: [],
      rateLimits: DEFAULT_RATE_LIMITS,
    },
    async () => openApiPlatformAPI.generateSpec("v1")
  );

  register(
    {
      id: "organizations.get",
      name: "Get Organization",
      description: "Returns an organization's profile by id.",
      method: "GET",
      path: "/organizations/{id}",
      version: "v1",
      visibility: "internal",
      status: "active",
      tags: ["organizations"],
      owner: "platform-team",
      permission: { resourceType: "organization", action: "read" },
      scopes: ["organization:read"],
      rateLimits: DEFAULT_RATE_LIMITS,
    },
    async ctx => {
      const organization = organizationRegistry.lookup(ctx.params.id);
      if (!organization) throw new Error(`Organization not found: ${ctx.params.id}`);
      return organization;
    }
  );

  register(
    {
      id: "organizations.create",
      name: "Create Organization",
      description: "Creates a new organization owned by the authenticated user.",
      method: "POST",
      path: "/organizations",
      version: "v1",
      visibility: "internal",
      status: "active",
      tags: ["organizations"],
      owner: "platform-team",
      scopes: ["organization:create"],
      rateLimits: [{ scope: "user", limit: 10, windowMs: 60_000 }, ...DEFAULT_RATE_LIMITS],
      requestSchema: {
        name: "CreateOrganizationRequest",
        fields: [
          { name: "name", type: "string", required: true, description: "Organization display name." },
          { name: "slug", type: "string", required: false },
        ],
      },
    },
    async ctx => {
      if (!ctx.userId) throw new Error("Authentication required to create an organization.");
      const body = ctx.body as { name: string; slug?: string };
      return organizationEngine.create({ name: body.name, slug: body.slug, ownerId: ctx.userId });
    }
  );

  register(
    {
      id: "connectors.marketplace.list",
      name: "Browse Connector Marketplace",
      description: "Lists available connectors, optionally filtered by category.",
      method: "GET",
      path: "/connectors/marketplace",
      version: "v1",
      visibility: "internal",
      status: "active",
      tags: ["connectors"],
      owner: "platform-team",
      permission: { resourceType: "connector", action: "read" },
      scopes: ["connector:read"],
      rateLimits: DEFAULT_RATE_LIMITS,
    },
    async ctx => connectorMarketplaceAPI.browse(ctx.query.category as never)
  );

  register(
    {
      id: "developer.apiKeys.create",
      name: "Create API Key",
      description: "Issues a new API key for the authenticated organization. The plaintext key is returned once and never stored.",
      method: "POST",
      path: "/developer/api-keys",
      version: "v1",
      visibility: "internal",
      status: "active",
      tags: ["developer"],
      owner: "platform-team",
      scopes: ["*"],
      rateLimits: [{ scope: "organization", limit: 20, windowMs: 3_600_000 }],
      requestSchema: {
        name: "CreateApiKeyRequest",
        fields: [
          { name: "name", type: "string", required: true },
          { name: "scopes", type: "array", required: false, items: "string" },
        ],
      },
    },
    async ctx => {
      if (!ctx.organizationId) throw new Error("X-Organization-Id header is required.");
      const body = ctx.body as { name: string; scopes?: string[] };
      return developerPlatformAPI.createApiKey(ctx.organizationId, body.name, body.scopes ?? ["*"]);
    }
  );

  register(
    {
      id: "developer.apiKeys.list",
      name: "List API Keys",
      description: "Lists API keys for the authenticated organization (key hashes are never returned).",
      method: "GET",
      path: "/developer/api-keys",
      version: "v1",
      visibility: "internal",
      status: "active",
      tags: ["developer"],
      owner: "platform-team",
      scopes: ["*"],
      rateLimits: DEFAULT_RATE_LIMITS,
    },
    async ctx => {
      if (!ctx.organizationId) throw new Error("X-Organization-Id header is required.");
      return developerPlatformAPI.listApiKeys(ctx.organizationId).map(k => ({ id: k.id, name: k.name, keyPrefix: k.keyPrefix, scopes: k.scopes, isActive: k.isActive, createdAt: k.createdAt, lastUsedAt: k.lastUsedAt }));
    }
  );
}

function register(definition: ApiContractDefinition, handler: ContractHandler): void {
  contractRegistry.register(definition, handler);
}
