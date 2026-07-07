/**
 * Calixo Platform - API Contract Platform API
 *
 * The Developer SDK's authoring surface (§24 of the mandate): define a new
 * endpoint's contract + handler once, and the Gateway, OpenAPI spec, SDK
 * generator, and Developer Portal all pick it up automatically — no
 * platform internals need to change.
 */
import { contractRegistry } from "./ContractRegistry";
import { platformEventBus } from "../events/PlatformEventBus";
import type { ApiContractDefinition, ContractHandler } from "./types";

export interface DefineContractInput extends Omit<ApiContractDefinition, "status"> {
  status?: ApiContractDefinition["status"];
}

export class ApiContractPlatformAPI {
  async define(input: DefineContractInput, handler: ContractHandler): Promise<void> {
    const definition: ApiContractDefinition = { status: "active", ...input };
    contractRegistry.register(definition, handler);
    await platformEventBus.publish({ type: "ContractRegistered", payload: { contractId: definition.id, method: definition.method, path: definition.path, version: definition.version } });
  }

  async deprecate(contractId: string, sunsetAt?: string, migrationNotes?: string): Promise<boolean> {
    const deprecated = contractRegistry.deprecate(contractId, sunsetAt, migrationNotes);
    if (deprecated) {
      await platformEventBus.publish({ type: "ContractDeprecated", payload: { contractId, sunsetAt } });
    }
    return deprecated;
  }
}

export const apiContractPlatformAPI = new ApiContractPlatformAPI();
