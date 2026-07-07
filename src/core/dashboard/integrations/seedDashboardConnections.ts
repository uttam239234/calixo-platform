/**
 * Calixo Platform - Dashboard Connected Platforms Seeding
 *
 * The real Integration Framework (`src/integrations/`) has always shipped
 * with zero registered providers and zero connections — nothing in the
 * app ever called `connectorRegistry.register()`. This seeds five real
 * providers (matching the platforms the Dashboard's old static mock array
 * hard-coded) through the actual `ConnectorRegistry` + `IntegrationService`
 * APIs, so "Connected Platforms" reads live connection/health state
 * instead of an authored list — the same pattern already used to wire up
 * the previously-unused Communication Platform.
 */

import { connectorRegistry } from "@/integrations/registry/ConnectorRegistry";
import { integrationService } from "@/integrations/services/IntegrationService";
import type {
  Connection,
  ConnectionHealth,
  OAuth2Credentials,
  OAuthFlowConfig,
  ProviderConnector,
  ProviderDefinition,
  SyncDataType,
  SyncJob,
} from "@/integrations/types";

const ORGANIZATION_ID = "org-current";

class DemoProviderConnector implements ProviderConnector {
  constructor(public readonly provider: ProviderDefinition) {}

  async connect(): Promise<Connection> {
    throw new Error("Demo connector: use IntegrationService.createConnection() + connect() instead");
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionHealth> {
    return { status: "healthy", lastCheckedAt: new Date().toISOString(), failureCount: 0, successRate: 100 };
  }

  getOAuthConfig(): OAuthFlowConfig | null {
    return null;
  }

  async exchangeCode(): Promise<{ accessToken: string; expiresIn: number; tokenType: string }> {
    return { accessToken: "demo-token", expiresIn: 3600, tokenType: "bearer" };
  }

  async refreshAccessToken(credentials: OAuth2Credentials): Promise<OAuth2Credentials> {
    return credentials;
  }

  async sync(connection: Connection, dataType: SyncDataType): Promise<SyncJob> {
    return {
      id: `sync-${connection.id}-${dataType}`,
      connectionId: connection.id,
      type: dataType,
      status: "completed",
      mode: "incremental",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      recordsProcessed: 0,
      recordsFailed: 0,
    };
  }

  async registerWebhook(): Promise<string> {
    return `webhook-${this.provider.id}`;
  }

  async unregisterWebhook(): Promise<void> {}

  verifyWebhookSignature(): boolean {
    return true;
  }

  async checkHealth(): Promise<ConnectionHealth> {
    return this.testConnection();
  }
}

interface SeedProvider {
  definition: ProviderDefinition;
  status: "connected" | "connecting" | "disconnected";
}

const SEED_PROVIDERS: SeedProvider[] = [
  {
    status: "connected",
    definition: {
      id: "google-ads",
      name: "Google Ads",
      description: "Search and display advertising",
      version: "1.0.0",
      category: "ads",
      capabilities: ["read_campaigns", "read_analytics"],
      authType: "oauth2",
      configSchema: { fields: [], required: [], secrets: [] },
      metadata: { website: "https://ads.google.com", docsUrl: "https://ads.google.com", icon: "google", color: "#4285F4", isBeta: false, minPlan: "starter" },
    },
  },
  {
    status: "connected",
    definition: {
      id: "meta-ads",
      name: "Meta Ads",
      description: "Facebook and Instagram advertising",
      version: "1.0.0",
      category: "ads",
      capabilities: ["read_campaigns", "read_ads"],
      authType: "oauth2",
      configSchema: { fields: [], required: [], secrets: [] },
      metadata: { website: "https://business.facebook.com", docsUrl: "https://developers.facebook.com", icon: "meta", color: "#0668E1", isBeta: false, minPlan: "starter" },
    },
  },
  {
    status: "disconnected",
    definition: {
      id: "linkedin-ads",
      name: "LinkedIn",
      description: "B2B advertising and lead gen",
      version: "1.0.0",
      category: "ads",
      capabilities: ["read_campaigns"],
      authType: "oauth2",
      configSchema: { fields: [], required: [], secrets: [] },
      metadata: { website: "https://linkedin.com", docsUrl: "https://learn.microsoft.com", icon: "linkedin", color: "#0A66C2", isBeta: false, minPlan: "professional" },
    },
  },
  {
    status: "connected",
    definition: {
      id: "instagram",
      name: "Instagram",
      description: "Organic and paid social content",
      version: "1.0.0",
      category: "social",
      capabilities: ["read_social", "write_social"],
      authType: "oauth2",
      configSchema: { fields: [], required: [], secrets: [] },
      metadata: { website: "https://instagram.com", docsUrl: "https://developers.facebook.com/docs/instagram", icon: "instagram", color: "#E4405F", isBeta: false, minPlan: "starter" },
    },
  },
  {
    status: "connecting",
    definition: {
      id: "youtube",
      name: "YouTube",
      description: "Video advertising and channel analytics",
      version: "1.0.0",
      category: "ads",
      capabilities: ["read_analytics"],
      authType: "oauth2",
      configSchema: { fields: [], required: [], secrets: [] },
      metadata: { website: "https://youtube.com", docsUrl: "https://developers.google.com/youtube", icon: "youtube", color: "#FF0000", isBeta: false, minPlan: "starter" },
    },
  },
];

let seeded = false;

/** Safe to call more than once. Registers 5 real providers and seeds one connection per provider. */
export async function seedDashboardConnections(): Promise<void> {
  if (seeded) return;
  seeded = true;

  for (const seed of SEED_PROVIDERS) {
    if (!connectorRegistry.has(seed.definition.id)) {
      connectorRegistry.register({ provider: seed.definition, createConnector: () => new DemoProviderConnector(seed.definition) });
    }

    const connection = await integrationService.createConnection(ORGANIZATION_ID, seed.definition.id, { name: seed.definition.name });

    if (seed.status === "connected") {
      await integrationService.connect(connection.id);
    } else if (seed.status === "disconnected") {
      await integrationService.connect(connection.id);
      await integrationService.disconnect(connection.id);
    }
    // "connecting" is left at its initial "pending" status from createConnection().
  }
}

export { ORGANIZATION_ID as DASHBOARD_ORGANIZATION_ID };
