/**
 * Calixo Platform - Repository Platform API
 *
 * The sanctioned way to resolve a repository for an entity type — wraps
 * `RepositoryRegistry`/its factory so callers never `new InMemoryRepository()`
 * themselves or reach into a module's internal repo instance directly.
 */
import type { BaseEntity, RepositoryRegistration } from "./types";
import { repositoryRegistry } from "./RepositoryRegistry";
import type { InMemoryRepository } from "./InMemoryRepository";

export class RepositoryPlatformAPI {
  resolve<T extends BaseEntity>(entityType: string): InMemoryRepository<T> {
    return repositoryRegistry.resolve<T>(entityType);
  }

  registerExisting(registration: RepositoryRegistration): void {
    repositoryRegistry.register(registration);
  }

  isRegistered(entityType: string): boolean {
    return repositoryRegistry.isRegistered(entityType);
  }

  list(): RepositoryRegistration[] {
    return repositoryRegistry.list();
  }

  snapshot(): Record<string, { module: string; kind: string; origin: string; count: number }> {
    const snapshot: Record<string, { module: string; kind: string; origin: string; count: number }> = {};
    for (const reg of repositoryRegistry.list()) {
      snapshot[reg.entityType] = { module: reg.module, kind: reg.kind, origin: reg.origin, count: reg.count() };
    }
    return snapshot;
  }
}

export const repositoryPlatformAPI = new RepositoryPlatformAPI();
