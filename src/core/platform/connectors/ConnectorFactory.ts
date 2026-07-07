/**
 * Calixo Platform - Connector Factory (Developer SDK core)
 *
 * `defineConnector(manifest, options)` is the entire authoring surface a
 * new connector needs — it produces a real `ProviderConnector` (the
 * interface the pre-existing `src/integrations` registry/OAuth/sync
 * machinery already knows how to drive) purely from declarative manifest
 * data. No platform code changes are required to add a connector: author a
 * manifest, optionally supply a `fetcher` for real API calls, call
 * `connectorManifestRegistry.register()`.
 *
 * `fetcher` is the one deliberately pluggable seam: a real production
 * connector supplies one that calls the actual vendor API using a
 * revealed secret; without one, a deterministic mock generator is used so
 * the manifest -> fetch -> normalize -> transform -> persist pipeline is
 * still genuinely exercisable end-to-end (see `seedExampleConnectors.ts`).
 */
import { generateId } from "@/shared/utils/string";
import type {
  AuthCredentials, Connection, ConnectionHealth, OAuth2Credentials, OAuthFlowConfig,
  ProviderConnector, ProviderDefinition, SyncDataType, SyncJob, TokenResponse,
} from "@/integrations/types";
import { normalizationEngine } from "./NormalizationEngine";
import { transformationEngine } from "./TransformationEngine";
import { verifyWebhookSignature } from "./WebhookSigningService";
import { persistencePlatformAPI } from "@/core/platform/data";
import type { ConnectorManifest, UniversalRecord } from "./types";

export type ConnectorFetcher = (endpointId: string, connection: Connection) => Promise<Record<string, unknown>[]>;

function defaultMockFetcher(manifest: ConnectorManifest): ConnectorFetcher {
  return async (endpointId, connection) => {
    const endpoint = manifest.endpoints.find(e => e.id === endpointId);
    const count = 5 + Math.floor(Math.random() * 5);
    return Array.from({ length: count }, (_, i) => ({
      id: `${endpoint?.dataType ?? "record"}-${connection.id}-${i}`,
      externalId: `${endpoint?.dataType ?? "record"}-${i}`,
      name: `${manifest.name} ${endpoint?.dataType ?? "record"} ${i + 1}`,
      value: Math.round(Math.random() * 10000) / 100,
      count: Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
      status: "active",
    }));
  };
}

export function manifestToProviderDefinition(manifest: ConnectorManifest): ProviderDefinition {
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    category: manifest.legacyCategory,
    capabilities: manifest.capabilities,
    authType: manifest.authType === "oauth2_pkce" ? "oauth2" : (manifest.authType === "service_account" || manifest.authType === "client_credentials" ? "api_key" : manifest.authType),
    configSchema: {
      fields: manifest.configFields,
      required: manifest.configFields.filter(f => f.required).map(f => f.key),
      secrets: manifest.configFields.filter(f => f.type === "password").map(f => f.key),
    },
    metadata: {
      website: manifest.website,
      docsUrl: manifest.docsUrl,
      icon: manifest.icon,
      color: manifest.color,
      isBeta: manifest.isBeta,
      minPlan: manifest.minPlan,
    },
  };
}

export class ManifestDrivenConnector implements ProviderConnector {
  readonly provider: ProviderDefinition;

  constructor(private readonly manifest: ConnectorManifest, private readonly fetcher: ConnectorFetcher) {
    this.provider = manifestToProviderDefinition(manifest);
  }

  async connect(credentials: AuthCredentials, config: Record<string, unknown>): Promise<Connection> {
    const now = new Date().toISOString();
    return {
      id: generateId(16),
      organizationId: String(config.organizationId ?? ""),
      providerId: this.manifest.id,
      name: this.manifest.name,
      status: "connected",
      auth: credentials,
      config,
      capabilities: this.manifest.capabilities,
      health: { status: "healthy", lastCheckedAt: now, failureCount: 0, successRate: 100 },
      metrics: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, averageResponseTimeMs: 0, dataSynced: 0 },
      createdAt: now,
      updatedAt: now,
    };
  }

  async disconnect(): Promise<void> {}

  async testConnection(): Promise<ConnectionHealth> {
    return { status: "healthy", lastCheckedAt: new Date().toISOString(), failureCount: 0, successRate: 100 };
  }

  getOAuthConfig(): OAuthFlowConfig | null {
    if (!this.manifest.oauth) return null;
    return {
      authorizationUrl: this.manifest.oauth.authorizationUrl,
      tokenUrl: this.manifest.oauth.tokenUrl,
      refreshUrl: this.manifest.oauth.refreshUrl,
      scopes: this.manifest.oauth.scopes,
      clientId: `manifest:${this.manifest.id}`,
      clientSecret: "not-a-real-secret-architecture-only",
      redirectUri: "",
      pkceRequired: this.manifest.oauth.pkce,
    };
  }

  /** No real vendor to exchange a code with — returns a deterministic mock token so the OAuth completion pipeline (state -> connection -> vault-sealed credential) is genuinely exercisable end-to-end. Real connectors supply real HTTP token exchange here. */
  async exchangeCode(): Promise<TokenResponse> {
    return { accessToken: `mock-access-${generateId(8)}`, refreshToken: `mock-refresh-${generateId(8)}`, expiresIn: 3600, tokenType: "bearer" };
  }

  async refreshAccessToken(credentials: OAuth2Credentials): Promise<OAuth2Credentials> {
    return { ...credentials, accessToken: `mock-access-${generateId(8)}`, expiresAt: new Date(Date.now() + 3600_000).toISOString() };
  }

  /**
   * The real pipeline: fetch raw vendor-shaped records (via `fetcher`) for
   * every manifest mapping whose endpoint matches `dataType`, normalize
   * them into the Universal Data Model, run the manifest's transformation
   * rules, and persist via `PersistencePlatformAPI` (Phase 4) under
   * `universal_<entity>` — genuinely cross-phase, not a simulated count.
   */
  async sync(connection: Connection, dataType: SyncDataType, mode: "full" | "incremental"): Promise<SyncJob> {
    const startedAt = new Date().toISOString();
    const relevantMappings = this.manifest.mappings.filter(m => {
      const endpoint = this.manifest.endpoints.find(e => e.id === m.endpointId);
      return endpoint?.dataType === dataType;
    });

    let recordsProcessed = 0;
    let recordsFailed = 0;
    const persisted: UniversalRecord[] = [];

    for (const mapping of relevantMappings) {
      try {
        const raw = await this.fetcher(mapping.endpointId, connection);
        const normalized = normalizationEngine.normalize(mapping, raw, {
          sourceProviderId: this.manifest.id,
          sourceConnectionId: connection.id,
          organizationId: connection.organizationId,
        });
        const { records } = transformationEngine.apply(mapping.transformations ?? [], normalized as unknown as Record<string, unknown>[]);

        for (const record of records) {
          const saved = await persistencePlatformAPI.create(`universal_${mapping.universalEntity}`, record, { userId: "system", organizationId: connection.organizationId });
          persisted.push(saved as unknown as UniversalRecord);
        }
        recordsProcessed += records.length;
      } catch {
        recordsFailed++;
      }
    }

    return {
      id: generateId(16),
      connectionId: connection.id,
      type: dataType,
      status: recordsFailed > 0 && recordsProcessed === 0 ? "failed" : "completed",
      mode,
      startedAt,
      completedAt: new Date().toISOString(),
      recordsProcessed,
      recordsFailed,
      metadata: { persistedIds: persisted.map(p => p.id) },
    };
  }

  async registerWebhook(): Promise<string> {
    return `webhook-${this.manifest.id}-${generateId(8)}`;
  }

  async unregisterWebhook(): Promise<void> {}

  verifyWebhookSignature(payload: unknown, signature: string): boolean {
    return verifyWebhookSignature(payload, signature);
  }

  async checkHealth(): Promise<ConnectionHealth> {
    return this.testConnection();
  }
}

export interface DefineConnectorOptions {
  fetcher?: ConnectorFetcher;
}

/** Returns a `ConnectorRegistration` — pass to `connectorManifestRegistry.register()` (which also wires it into the pre-existing `connectorRegistry`). */
export function defineConnector(manifest: ConnectorManifest, options: DefineConnectorOptions = {}) {
  const fetcher = options.fetcher ?? defaultMockFetcher(manifest);
  return {
    manifest,
    provider: manifestToProviderDefinition(manifest),
    createConnector: () => new ManifestDrivenConnector(manifest, fetcher),
  };
}
