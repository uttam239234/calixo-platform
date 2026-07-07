/**
 * Calixo Platform - Schema Platform API
 */
import type { EntitySchemaDefinition } from "./types";
import { schemaRegistry } from "./SchemaRegistry";

export class SchemaPlatformAPI {
  registerSchema(schema: EntitySchemaDefinition): void {
    schemaRegistry.register(schema);
  }

  getSchema(entityType: string): EntitySchemaDefinition | undefined {
    return schemaRegistry.get(entityType);
  }

  listEntityTypes(): string[] {
    return schemaRegistry.list().map(s => s.entityType);
  }
}

export const schemaPlatformAPI = new SchemaPlatformAPI();
