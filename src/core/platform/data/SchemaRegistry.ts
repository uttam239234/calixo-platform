/**
 * Calixo Platform - Schema & Entity Registry
 *
 * Registers the canonical field shape for each entity type so
 * `SchemaPlatformAPI` can answer "what fields does entity X have, and does
 * it extend `BaseEntity`?" — genuinely useful for the Repository Factory
 * and for future validation, without requiring a real database's
 * information_schema.
 */
import type { EntitySchemaDefinition } from "./types";

export class SchemaRegistry {
  private schemas = new Map<string, EntitySchemaDefinition>();

  register(schema: EntitySchemaDefinition): void {
    this.schemas.set(schema.entityType, schema);
  }

  get(entityType: string): EntitySchemaDefinition | undefined {
    return this.schemas.get(entityType);
  }

  list(): EntitySchemaDefinition[] {
    return Array.from(this.schemas.values());
  }

  count(): number {
    return this.schemas.size;
  }
}

export const schemaRegistry = new SchemaRegistry();

const BASE_ENTITY_SCHEMA: EntitySchemaDefinition = {
  entityType: "__base_entity__",
  extendsBaseEntity: true,
  fields: [
    { name: "id", type: "string", required: true },
    { name: "organizationId", type: "string", required: false },
    { name: "workspaceId", type: "string", required: false },
    { name: "brandId", type: "string", required: false },
    { name: "ownerId", type: "string", required: false },
    { name: "createdAt", type: "date", required: true },
    { name: "updatedAt", type: "date", required: true },
    { name: "createdBy", type: "string", required: false },
    { name: "updatedBy", type: "string", required: false },
    { name: "version", type: "number", required: true },
    { name: "status", type: "string", required: true },
    { name: "metadata", type: "json", required: false },
    { name: "tags", type: "array", required: false },
    { name: "labels", type: "json", required: false },
    { name: "isDeleted", type: "boolean", required: true },
    { name: "deletedAt", type: "date", required: false },
  ],
};

schemaRegistry.register(BASE_ENTITY_SCHEMA);
