/**
 * Calixo Platform - Persistence Platform API
 *
 * The top-level entry point for reading/writing any entity: composes
 * `EntityManager` (writes: create/update/soft-delete/restore, each
 * audited + versioned + event-published) with `RepositoryPlatformAPI`
 * (reads: getById/query) so a caller never touches a repository or the
 * registry directly.
 */
import type { BaseEntity, PagedResult, QueryObject } from "./types";
import { entityManager, type EntityActor } from "./EntityManager";
import { repositoryPlatformAPI } from "./RepositoryPlatformAPI";
import { versioningEngine } from "./VersioningEngine";
import type { VersionSnapshot } from "./types";

export class PersistencePlatformAPI {
  async getById<T extends BaseEntity>(entityType: string, id: string): Promise<T | null> {
    return repositoryPlatformAPI.resolve<T>(entityType).getById(id);
  }

  async query<T extends BaseEntity>(entityType: string, query: QueryObject): Promise<PagedResult<T>> {
    return repositoryPlatformAPI.resolve<T>(entityType).query(query);
  }

  async create<T extends BaseEntity>(entityType: string, data: Partial<T>, actor: EntityActor): Promise<T> {
    return entityManager.create<T>(entityType, data, actor);
  }

  async update<T extends BaseEntity>(entityType: string, id: string, patch: Partial<T>, actor: EntityActor): Promise<T> {
    return entityManager.update<T>(entityType, id, patch, actor);
  }

  async softDelete<T extends BaseEntity>(entityType: string, id: string, actor: EntityActor): Promise<T> {
    return entityManager.softDelete<T>(entityType, id, actor);
  }

  async restore<T extends BaseEntity>(entityType: string, id: string, actor: EntityActor): Promise<T> {
    return entityManager.restore<T>(entityType, id, actor);
  }

  getHistory(entityType: string, id: string): VersionSnapshot[] {
    return versioningEngine.getHistory(entityType, id);
  }
}

export const persistencePlatformAPI = new PersistencePlatformAPI();
