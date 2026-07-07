/**
 * Calixo Platform - Repository Registry & Factory
 *
 * ONE introspectable index of every repository in the platform — both the
 * brand-new generic ones this package creates on demand, and every
 * pre-existing module repository (access/aios/communication/background),
 * registered as-is via `registerExistingRepositories.ts`. This does not
 * change what those existing repositories do; it only makes them
 * discoverable in one place instead of only findable by whoever happens to
 * import that specific module.
 */
import { generateId } from "@/shared/utils/string";
import type { BaseEntity, RepositoryOrigin, RepositoryRegistration } from "./types";
import { InMemoryRepository } from "./InMemoryRepository";

export class RepositoryRegistry {
  private registrations = new Map<string, RepositoryRegistration>();
  private genericRepositories = new Map<string, InMemoryRepository<BaseEntity>>();

  /** Register a pre-existing (or new) repository instance for introspection. Does not take ownership of it. */
  register(registration: RepositoryRegistration): void {
    this.registrations.set(registration.entityType, registration);
  }

  isRegistered(entityType: string): boolean {
    return this.registrations.has(entityType);
  }

  get(entityType: string): RepositoryRegistration | undefined {
    return this.registrations.get(entityType);
  }

  list(): RepositoryRegistration[] {
    return Array.from(this.registrations.values());
  }

  listByOrigin(origin: RepositoryOrigin): RepositoryRegistration[] {
    return this.list().filter(r => r.origin === origin);
  }

  count(): number {
    return this.registrations.size;
  }

  /**
   * Repository Factory / Resolver: lazily creates (and registers) a generic
   * `InMemoryRepository<T>` for an entity type that has no bespoke
   * repository yet. Existing module repositories are never shadowed —
   * this only ever creates NEW entries for entity types not already
   * registered by `registerExistingRepositories.ts`.
   */
  resolve<T extends BaseEntity>(entityType: string): InMemoryRepository<T> {
    let repo = this.genericRepositories.get(entityType);
    if (!repo) {
      repo = new InMemoryRepository<BaseEntity>(entityType, () => generateId(16));
      this.genericRepositories.set(entityType, repo);
      this.register({
        entityType,
        module: "core/platform/data",
        kind: "InMemoryRepository",
        origin: "generic",
        count: () => repo!.sizeSync(),
      });
    }
    return repo as unknown as InMemoryRepository<T>;
  }
}

export const repositoryRegistry = new RepositoryRegistry();
