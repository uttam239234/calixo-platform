/**
 * Calixo Platform - Migration Platform API
 */
import type { MigrationDefinition, MigrationRecord } from "./types";
import { migrationEngine } from "./MigrationEngine";

export class MigrationPlatformAPI {
  register(definition: MigrationDefinition): void {
    migrationEngine.register(definition);
  }

  apply(): Promise<MigrationRecord[]> {
    return migrationEngine.apply();
  }

  rollback(): Promise<MigrationRecord | null> {
    return migrationEngine.rollback();
  }

  history(): MigrationRecord[] {
    return migrationEngine.getHistory();
  }
}

export const migrationPlatformAPI = new MigrationPlatformAPI();
