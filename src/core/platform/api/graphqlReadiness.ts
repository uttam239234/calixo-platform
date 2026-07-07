/**
 * Calixo Platform - GraphQL Readiness (NOT implemented)
 *
 * Per the mandate: "Do NOT implement GraphQL execution. Prepare
 * architecture." This registry lets a future phase declare a schema/
 * resolver map/federation ownership against the SAME Contract Registry's
 * permission model, without executing anything — no `graphql-js` (or any
 * GraphQL engine) dependency is added this phase.
 */
import type { FederationReadiness, GraphQLSchemaDefinition } from "./types";

export class GraphQLReadinessRegistry {
  private schemas = new Map<string, GraphQLSchemaDefinition>();
  private federation: FederationReadiness[] = [];

  declareType(schema: GraphQLSchemaDefinition): void {
    this.schemas.set(schema.typeName, schema);
  }

  declareFederationOwnership(entry: FederationReadiness): void {
    this.federation.push(entry);
  }

  listTypes(): GraphQLSchemaDefinition[] {
    return Array.from(this.schemas.values());
  }

  listFederation(): FederationReadiness[] {
    return [...this.federation];
  }

  /** Always throws — there is no execution engine. Declared so callers get a clear, honest error instead of `undefined`. */
  execute(): never {
    throw new Error("GraphQL execution is not implemented — this phase only prepares schema/resolver/federation architecture, per the mandate.");
  }

  count(): number {
    return this.schemas.size;
  }
}

export const graphqlReadinessRegistry = new GraphQLReadinessRegistry();
