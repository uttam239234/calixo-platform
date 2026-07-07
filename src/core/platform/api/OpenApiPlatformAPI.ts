/**
 * Calixo Platform - OpenAPI Platform API
 */
import { openApiGenerator } from "./OpenApiGenerator";
import type { ApiVersion } from "./types";

export class OpenApiPlatformAPI {
  generateSpec(version: ApiVersion): Record<string, unknown> {
    return openApiGenerator.generate(version);
  }
}

export const openApiPlatformAPI = new OpenApiPlatformAPI();
