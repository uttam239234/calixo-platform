/**
 * Calixo Platform - Documentation Platform API
 *
 * Human-readable developer docs (examples, descriptions, error catalogs)
 * derived from the same Contract Registry the OpenAPI spec comes from —
 * "no duplicated documentation." Distinct from `OpenApiPlatformAPI` (the
 * raw machine-readable spec): this is the presentation layer a Developer
 * Portal page would render.
 */
import { contractRegistry } from "./ContractRegistry";
import type { ApiContractDefinition } from "./types";

export interface EndpointDocEntry {
  definition: ApiContractDefinition;
  exampleRequest?: unknown;
  exampleResponse?: unknown;
  commonErrors: { code: string; message: string }[];
}

const COMMON_ERRORS = [
  { code: "unauthenticated", message: "Missing or invalid Bearer token / X-API-Key header." },
  { code: "forbidden", message: "The authenticated user/key lacks the required permission or scope." },
  { code: "validation_failed", message: "The request body did not match the endpoint's schema — see `details` for field-level errors." },
  { code: "rate_limited", message: "Too many requests — see the `Retry-After`-equivalent rate limit rule that was violated." },
];

export class DocumentationPlatformAPI {
  listEndpoints(): ApiContractDefinition[] {
    return contractRegistry.list();
  }

  getDocEntry(contractId: string): EndpointDocEntry | undefined {
    const contract = contractRegistry.get(contractId);
    if (!contract) return undefined;
    const example = contract.definition.examples?.[0];
    return {
      definition: contract.definition,
      exampleRequest: example?.request,
      exampleResponse: example?.response,
      commonErrors: COMMON_ERRORS,
    };
  }

  searchByTag(tag: string): ApiContractDefinition[] {
    return contractRegistry.listByTag(tag);
  }
}

export const documentationPlatformAPI = new DocumentationPlatformAPI();
