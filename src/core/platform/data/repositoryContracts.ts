/**
 * Calixo Platform - Generic Repository Contracts
 *
 * The canonical repository interface set every module's data access should
 * be measurable against. Modeled on (and superseding) the orphaned generic
 * `Repository`/`CrudRepository`/`PaginatedRepository` interfaces in
 * `src/repositories/interfaces/index.ts` — that file was designed once,
 * never implemented, and never imported anywhere (confirmed via repo-wide
 * search during the Enterprise Data Architecture Audit); its shape was
 * good, so it is reused here rather than redesigned, extended with the
 * Bulk/Streaming/Specification capabilities the mandate additionally asks
 * for. The old file is left in place (deleting unreferenced code is out of
 * scope for this phase) with a pointer comment to here.
 */
import type { BaseEntity, PagedResult, QueryObject, Specification } from "./types";

export interface Repository<T extends BaseEntity> {
  getById(id: string): Promise<T | null>;
  exists(id: string): Promise<boolean>;
  count(query?: QueryObject): Promise<number>;
}

export interface CrudRepository<T extends BaseEntity, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
  extends Repository<T> {
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export interface PaginatedRepository<T extends BaseEntity> {
  query(query: QueryObject): Promise<PagedResult<T>>;
}

export interface BulkRepository<T extends BaseEntity, CreateDTO = Partial<T>> {
  createMany(items: CreateDTO[]): Promise<T[]>;
  updateMany(ids: string[], data: Partial<T>): Promise<number>;
  deleteMany(ids: string[]): Promise<number>;
}

/** Batch retrieval — distinct from Bulk (writes): fetch many by id in one call, the shape a DataLoader-style batching layer needs. */
export interface BatchRepository<T extends BaseEntity> {
  getByIds(ids: string[]): Promise<T[]>;
}

/** For "billions of records" scale: iterate without materializing the whole result set. In-memory implementations chunk the underlying array; a future real-DB adapter would use a server-side cursor. */
export interface StreamingRepository<T extends BaseEntity> {
  stream(query: QueryObject, chunkSize?: number): AsyncGenerator<T[], void, void>;
}

export interface SpecificationRepository<T extends BaseEntity> {
  findBySpecification(spec: Specification<T>): Promise<T[]>;
}

export interface SoftDeletableRepository<T extends BaseEntity> {
  softDelete(id: string): Promise<T>;
  restore(id: string): Promise<T>;
  purge(id: string): Promise<boolean>;
}

/** Full contract a brand-new entity's repository is expected to satisfy; existing module repositories are NOT required to implement this — they are registered into `RepositoryRegistry` as-is (see `registerExistingRepositories.ts`). */
export interface FullRepository<T extends BaseEntity, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
  extends CrudRepository<T, CreateDTO, UpdateDTO>,
    PaginatedRepository<T>,
    BulkRepository<T, CreateDTO>,
    BatchRepository<T>,
    StreamingRepository<T>,
    SpecificationRepository<T>,
    SoftDeletableRepository<T> {}
