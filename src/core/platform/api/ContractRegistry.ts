/**
 * Calixo Platform - API Contract Registry
 *
 * "Everything begins with contracts": a `RegisteredContract` (definition +
 * handler) is the ONE thing the Gateway, OpenAPI generator, SDK generator,
 * and Developer Portal all read from — register a contract once, and
 * routing/docs/SDK/rate-limits/permissions all derive from it. No
 * hand-written endpoint duplicates its own metadata.
 */
import { appLogger } from "@/logging";
import type { ApiContractDefinition, ApiVersion, ContractHandler, HttpMethod, RegisteredContract } from "./types";

function routeKey(method: HttpMethod, version: ApiVersion, path: string): string {
  return `${method} /${version}${path}`;
}

export class ContractRegistry {
  private contracts = new Map<string, RegisteredContract>();
  private byRoute = new Map<string, string>();

  register(definition: ApiContractDefinition, handler: ContractHandler): void {
    if (this.contracts.has(definition.id)) {
      appLogger.warn("ContractRegistry", `Contract ${definition.id} already registered, skipping`);
      return;
    }
    this.contracts.set(definition.id, { definition, handler });
    this.byRoute.set(routeKey(definition.method, definition.version, definition.path), definition.id);
    appLogger.info("ContractRegistry", `Contract registered: ${definition.method} /${definition.version}${definition.path} (${definition.id})`);
  }

  get(id: string): RegisteredContract | undefined {
    return this.contracts.get(id);
  }

  /** Resolves a contract by exact path first, then by a `{param}`-templated path — the routing step of the Gateway. */
  resolve(method: HttpMethod, version: ApiVersion, path: string): { contract: RegisteredContract; params: Record<string, string> } | undefined {
    const exactId = this.byRoute.get(routeKey(method, version, path));
    if (exactId) return { contract: this.contracts.get(exactId)!, params: {} };

    const pathSegments = path.split("/").filter(Boolean);
    for (const contract of this.contracts.values()) {
      if (contract.definition.method !== method || contract.definition.version !== version) continue;
      const templateSegments = contract.definition.path.split("/").filter(Boolean);
      if (templateSegments.length !== pathSegments.length) continue;

      const params: Record<string, string> = {};
      const matched = templateSegments.every((segment, i) => {
        if (segment.startsWith("{") && segment.endsWith("}")) {
          params[segment.slice(1, -1)] = pathSegments[i];
          return true;
        }
        return segment === pathSegments[i];
      });
      if (matched) return { contract, params };
    }
    return undefined;
  }

  list(): ApiContractDefinition[] {
    return Array.from(this.contracts.values()).map(c => c.definition);
  }

  listByVersion(version: ApiVersion): ApiContractDefinition[] {
    return this.list().filter(c => c.version === version);
  }

  listByTag(tag: string): ApiContractDefinition[] {
    return this.list().filter(c => c.tags.includes(tag));
  }

  deprecate(id: string, sunsetAt?: string, migrationNotes?: string): boolean {
    const entry = this.contracts.get(id);
    if (!entry) return false;
    entry.definition.status = "deprecated";
    entry.definition.deprecatedAt = new Date().toISOString();
    if (sunsetAt) entry.definition.sunsetAt = sunsetAt;
    if (migrationNotes) entry.definition.migrationNotes = migrationNotes;
    return true;
  }

  count(): number {
    return this.contracts.size;
  }
}

export const contractRegistry = new ContractRegistry();
