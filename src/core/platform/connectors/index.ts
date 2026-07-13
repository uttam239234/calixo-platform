/**
 * Calixo Platform - Enterprise Integration & Connector Platform
 *
 * Barrel for the fifth major `core/platform` subpackage (after
 * organizations/workspaces/subscription/featureFlags/events/tenant/
 * contracts/registry from Phase 1, identity from Phase 2, access from
 * Phase 3, and data from Phase 4): the Connector SDK (manifest-driven
 * authoring), Marketplace, Wizard, Normalization/Transformation platforms,
 * Secret Vault, Webhook signing, Health scoring, and the 8 Platform APIs —
 * all built on top of the pre-existing, real `src/integrations` module
 * rather than a rebuild.
 *
 * `initializeConnectorFoundation()` registers the base entity schema
 * for Universal Data Model entities into Phase 4's Schema Platform,
 * registers the example manifest-driven connector, and is idempotent.
 */

export * from "./types";
export * from "./SafeExpressionEvaluator";
export * from "./NormalizationEngine";
export * from "./TransformationEngine";
export * from "./ConnectorFactory";
export * from "./ConnectorManifestRegistry";
export * from "./ConnectorHealthEngine";
export * from "./WebhookSigningService";
export * from "./ConnectorWizardEngine";
export * from "./MarketplaceCatalog";
export * from "./ConnectorRuntime";

export * from "./ConnectorPlatformAPI";
export * from "./IntegrationPlatformAPI";
export * from "./ConnectorMarketplaceAPI";
export * from "./SynchronizationPlatformAPI";
export * from "./NormalizationPlatformAPI";
export * from "./TransformationPlatformAPI";
export * from "./SecretPlatformAPI";
export * from "./WebhookPlatformAPI";

import { schemaPlatformAPI } from "@/core/platform/data";
import { seedExampleConnectors } from "./seed/exampleConnectors";
import { seedAdditionalConnectors } from "./seed/additionalConnectors";

let initialized = false;

const UNIVERSAL_ENTITIES: { entityType: string; fields: string[] }[] = [
  { entityType: "universal_traffic", fields: ["sessions", "pageViews", "users", "channel", "date"] },
  { entityType: "universal_revenue", fields: ["amount", "currency", "date", "source"] },
  { entityType: "universal_campaign", fields: ["name", "status", "spend", "impressions", "clicks"] },
  { entityType: "universal_lead", fields: ["name", "email", "status", "source"] },
  { entityType: "universal_conversion", fields: ["type", "value", "currency", "occurredAt"] },
  { entityType: "universal_customer", fields: ["name", "email", "lifetimeValue"] },
  { entityType: "universal_content", fields: ["title", "type", "publishedAt", "url"] },
  { entityType: "universal_asset", fields: ["name", "type", "url"] },
  { entityType: "universal_brand", fields: ["name", "handle"] },
  { entityType: "universal_audience", fields: ["name", "size"] },
];

export async function initializeConnectorFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;

  for (const entity of UNIVERSAL_ENTITIES) {
    schemaPlatformAPI.registerSchema({
      entityType: entity.entityType,
      extendsBaseEntity: true,
      fields: entity.fields.map(name => ({ name, type: "string", required: false })),
    });
  }

  seedExampleConnectors();
  seedAdditionalConnectors();
}
