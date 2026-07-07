/**
 * Calixo Platform - Enterprise Data & Persistence Platform
 *
 * Barrel for the fourth major `core/platform` subpackage (after
 * organizations/workspaces/subscription/featureFlags/events/tenant/
 * contracts/registry from Phase 1, identity from Phase 2, and access from
 * Phase 3): canonical entity model, generic repository platform, entity
 * lifecycle (create/update/soft-delete/restore), transactions, versioning,
 * caching, search, storage, migrations, schema, and data governance.
 *
 * `initializeDataFoundation()` registers the base entity schema, the
 * Migration Platform's own bootstrap migration, and indexes the
 * representative sample of pre-existing module repositories described in
 * `registerExistingRepositories.ts`.
 */

export * from "./types";
export * from "./repositoryContracts";
export * from "./Specification";
export * from "./InMemoryRepository";
export * from "./RepositoryRegistry";
export * from "./registerExistingRepositories";
export * from "./EntityManager";
export * from "./TransactionManager";
export * from "./VersioningEngine";
export * from "./SoftDeleteEngine";
export * from "./CacheEngine";
export * from "./SearchEngine";
export * from "./MigrationEngine";
export * from "./SchemaRegistry";
export * from "./cqrs";
export * from "./governance";
export * from "./encryption";
export * from "./backup";

export * from "./storage/types";
export * from "./storage/LocalStorageProvider";
export * from "./storage/StorageProviderRegistry";

export * from "./PersistencePlatformAPI";
export * from "./RepositoryPlatformAPI";
export * from "./TransactionPlatformAPI";
export * from "./SearchPlatformAPI";
export * from "./StoragePlatformAPI";
export * from "./MigrationPlatformAPI";
export * from "./SchemaPlatformAPI";
export * from "./CachePlatformAPI";

import { registerExistingRepositories } from "./registerExistingRepositories";
import { migrationEngine } from "./MigrationEngine";

let initialized = false;

export async function initializeDataFoundation(): Promise<void> {
  if (initialized) return;
  initialized = true;

  migrationEngine.register({
    id: "0001_data_platform_bootstrap",
    name: "Enterprise Data Platform bootstrap",
    up: () => {
      // Intentionally a no-op beyond being recorded: there is no live schema
      // to migrate yet (see Remaining Roadmap). This exists so the
      // Migration Platform has at least one real, tracked history entry
      // rather than shipping with an empty, untested history array.
    },
  });
  await migrationEngine.apply();

  await registerExistingRepositories();
}
