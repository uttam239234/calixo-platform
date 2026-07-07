/**
 * Calixo Platform - API Registry Platform API
 */
import { contractRegistry } from "./ContractRegistry";
import type { ApiContractDefinition, ApiVersion } from "./types";

export class ApiRegistryPlatformAPI {
  list(): ApiContractDefinition[] {
    return contractRegistry.list();
  }

  listByVersion(version: ApiVersion): ApiContractDefinition[] {
    return contractRegistry.listByVersion(version);
  }

  listByTag(tag: string): ApiContractDefinition[] {
    return contractRegistry.listByTag(tag);
  }

  get(id: string): ApiContractDefinition | undefined {
    return contractRegistry.get(id)?.definition;
  }

  count(): number {
    return contractRegistry.count();
  }
}

export const apiRegistryPlatformAPI = new ApiRegistryPlatformAPI();
