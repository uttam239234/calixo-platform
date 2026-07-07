/**
 * Calixo Platform - Migration Platform
 *
 * A real, working migration/seed runner: register named, idempotent
 * `up`/`down` functions, `apply()` runs every not-yet-applied migration in
 * registration order and records it in `MigrationHistory`, `rollback()`
 * re-runs the most recently applied migration's `down` (if provided). There
 * is no real schema to migrate (no live database — see the Remaining
 * Roadmap), so this operates on the same seed-framework idiom already
 * proven by `seedOrganizationsPlatform`/`seedDefaultAccessPolicies`, made
 * generic and trackable instead of each module reinventing its own
 * one-off `let seeded = false` guard.
 */
import type { MigrationDefinition, MigrationRecord } from "./types";

export class MigrationEngine {
  private definitions: MigrationDefinition[] = [];
  private history: MigrationRecord[] = [];

  register(definition: MigrationDefinition): void {
    if (this.definitions.some(d => d.id === definition.id)) return;
    this.definitions.push(definition);
  }

  isApplied(id: string): boolean {
    return this.history.some(h => h.id === id && !h.rolledBackAt);
  }

  async apply(): Promise<MigrationRecord[]> {
    const applied: MigrationRecord[] = [];
    for (const definition of this.definitions) {
      if (this.isApplied(definition.id)) continue;
      await definition.up();
      const record: MigrationRecord = { id: definition.id, name: definition.name, appliedAt: new Date().toISOString() };
      this.history.push(record);
      applied.push(record);
    }
    return applied;
  }

  /** Rolls back the most recently applied migration that has a `down()`. */
  async rollback(): Promise<MigrationRecord | null> {
    for (let i = this.history.length - 1; i >= 0; i--) {
      const record = this.history[i];
      if (record.rolledBackAt) continue;
      const definition = this.definitions.find(d => d.id === record.id);
      if (!definition?.down) continue;
      await definition.down();
      record.rolledBackAt = new Date().toISOString();
      return record;
    }
    return null;
  }

  getHistory(): MigrationRecord[] {
    return [...this.history];
  }

  count(): number {
    return this.definitions.length;
  }
}

export const migrationEngine = new MigrationEngine();
