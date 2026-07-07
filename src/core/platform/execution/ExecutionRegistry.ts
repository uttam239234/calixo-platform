/**
 * Calixo Platform - Execution Registry
 *
 * Registered "Execution Types" — the Developer SDK's unit of registration
 * (mirrors Phase 6's `ContractRegistry`: define once, `ExecutionEngine`,
 * history, and monitoring all read from the same definition instead of each
 * caller re-specifying worker/priority/timeout/retry policy by hand).
 */
import type { ExecutionTypeDefinition } from "./types";

export class ExecutionRegistry {
  private types = new Map<string, ExecutionTypeDefinition>();

  register(definition: ExecutionTypeDefinition): ExecutionTypeDefinition {
    this.types.set(definition.id, definition);
    return definition;
  }

  get(id: string): ExecutionTypeDefinition | undefined {
    return this.types.get(id);
  }

  list(): ExecutionTypeDefinition[] {
    return Array.from(this.types.values());
  }

  listByWorker(worker: string): ExecutionTypeDefinition[] {
    return this.list().filter(t => t.worker === worker);
  }

  listByTag(tag: string): ExecutionTypeDefinition[] {
    return this.list().filter(t => t.tags.includes(tag));
  }

  /** Declared-but-not-implemented types (e.g. asset transcoding) — surfaced honestly rather than silently claiming they run. */
  listReadinessOnly(): ExecutionTypeDefinition[] {
    return this.list().filter(t => !t.isReal);
  }

  count(): number {
    return this.types.size;
  }
}

export const executionRegistry = new ExecutionRegistry();
