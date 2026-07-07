/**
 * Calixo Platform - Versioning Platform API
 *
 * v1/v2 coexistence, deprecation, and sunset — all derived from the same
 * Contract Registry (`ApiContractDefinition.version`/`status`/
 * `deprecatedAt`/`sunsetAt`/`migrationNotes`). "Compatibility" means both
 * versions of a contract can be registered and routed side-by-side by the
 * Gateway; there is no automatic request/response transformation between
 * versions — a v2 contract is just a distinct, independently authored
 * `ApiContractDefinition`.
 */
import { contractRegistry } from "./ContractRegistry";
import type { ApiContractDefinition, ApiVersion } from "./types";

export class VersioningPlatformAPI {
  listVersions(): ApiVersion[] {
    const versions = new Set(contractRegistry.list().map(c => c.version));
    return Array.from(versions).sort();
  }

  listDeprecated(version?: ApiVersion): ApiContractDefinition[] {
    return contractRegistry.list().filter(c => c.status === "deprecated" && (!version || c.version === version));
  }

  listSunset(): ApiContractDefinition[] {
    return contractRegistry.list().filter(c => c.status === "sunset");
  }

  async deprecate(contractId: string, sunsetAt?: string, migrationNotes?: string): Promise<boolean> {
    return contractRegistry.deprecate(contractId, sunsetAt, migrationNotes);
  }
}

export const versioningPlatformAPI = new VersioningPlatformAPI();
