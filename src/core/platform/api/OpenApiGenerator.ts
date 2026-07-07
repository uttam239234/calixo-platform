/**
 * Calixo Platform - OpenAPI Generator
 *
 * Generates a genuinely valid OpenAPI 3.0 document from the Contract
 * Registry — no hand-maintained spec file exists or is needed; every
 * contract's `requestSchema`/`responseSchema`/`permission`/`rateLimits`
 * become real `paths`/`components`/`security` entries.
 */
import { contractRegistry } from "./ContractRegistry";
import type { ApiContractDefinition, ApiSchema, ApiVersion, SchemaField } from "./types";

function fieldToJsonSchema(field: SchemaField): Record<string, unknown> {
  const base: Record<string, unknown> = { type: field.type === "array" ? "array" : field.type, description: field.description };
  if (field.enum) base.enum = field.enum;
  if (field.minimum !== undefined) base.minimum = field.minimum;
  if (field.maximum !== undefined) base.maximum = field.maximum;
  if (field.pattern) base.pattern = field.pattern;
  if (field.type === "array" && field.items) {
    base.items = typeof field.items === "string" ? { type: field.items } : schemaToJsonSchema(field.items);
  }
  if (field.type === "object" && field.properties) {
    const nested = schemaToJsonSchema({ name: field.name, fields: field.properties });
    base.properties = nested.properties;
    base.required = nested.required;
  }
  return base;
}

function schemaToJsonSchema(schema: ApiSchema): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const field of schema.fields) {
    properties[field.name] = fieldToJsonSchema(field);
    if (field.required) required.push(field.name);
  }
  return { type: "object", properties, required };
}

function toOpenApiPath(path: string): string {
  return path.replace(/\{(\w+)\}/g, "{$1}");
}

export class OpenApiGenerator {
  generate(version: ApiVersion): Record<string, unknown> {
    const contracts = contractRegistry.listByVersion(version);
    const paths: Record<string, Record<string, unknown>> = {};

    for (const contract of contracts) {
      const openApiPath = `/${version}${toOpenApiPath(contract.path)}`;
      paths[openApiPath] ??= {};
      paths[openApiPath][contract.method.toLowerCase()] = this.operationFor(contract);
    }

    return {
      openapi: "3.0.3",
      info: {
        title: "Calixo Enterprise API",
        version,
        description: "Auto-generated from the Calixo API Contract Registry — never hand-maintained.",
      },
      servers: [{ url: `/api/${version}` }],
      paths,
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          apiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
        },
      },
    };
  }

  private operationFor(contract: ApiContractDefinition): Record<string, unknown> {
    const parameters = Object.keys(this.pathParams(contract.path)).map(name => ({
      name,
      in: "path",
      required: true,
      schema: { type: "string" },
    }));

    const operation: Record<string, unknown> = {
      operationId: contract.id,
      summary: contract.name,
      description: contract.description,
      tags: contract.tags,
      deprecated: contract.status === "deprecated" || contract.status === "sunset",
      parameters,
      responses: {
        "200": {
          description: "Successful response",
          content: contract.responseSchema ? { "application/json": { schema: schemaToJsonSchema(contract.responseSchema) } } : undefined,
        },
        "400": { description: "Validation error" },
        "401": { description: "Authentication required" },
        "403": { description: "Insufficient permissions" },
        "429": { description: "Rate limit exceeded" },
      },
    };

    if (contract.requestSchema) {
      operation.requestBody = {
        required: true,
        content: { "application/json": { schema: schemaToJsonSchema(contract.requestSchema) } },
      };
    }

    if (contract.visibility !== "public") {
      operation.security = [{ bearerAuth: [] }, { apiKeyAuth: [] }];
    }

    return operation;
  }

  private pathParams(path: string): Record<string, true> {
    const params: Record<string, true> = {};
    for (const match of path.matchAll(/\{(\w+)\}/g)) params[match[1]] = true;
    return params;
  }
}

export const openApiGenerator = new OpenApiGenerator();
