/**
 * Calixo Platform - Generic In-Memory Repository
 *
 * The default `FullRepository<T>` implementation for any entity that
 * extends `BaseEntity` and doesn't yet have a bespoke repository. This is
 * the same `Map<string, T>`-per-instance pattern already proven across
 * every existing repository in the codebase (`InMemoryPromptRepository`,
 * `InMemoryUserRoleAssignmentRepository`, ...) — generalized once instead
 * of being reinvented per module. This is the "Database Abstraction"
 * layer's first real, working adapter; a Prisma/PostgreSQL adapter would
 * implement the same `FullRepository<T>` contract without any caller
 * changing (see `RepositoryRegistry`'s adapter-swap note).
 */
import type { BaseEntity, FilterCondition, PagedResult, QueryObject, Specification } from "./types";
import type { FullRepository } from "./repositoryContracts";

function getField(entity: unknown, field: string): unknown {
  return (entity as Record<string, unknown>)[field];
}

function matchesFilter(entity: unknown, condition: FilterCondition): boolean {
  const value = getField(entity, condition.field);
  switch (condition.operator) {
    case "eq": return value === condition.value;
    case "neq": return value !== condition.value;
    case "gt": return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "gte": return typeof value === "number" && typeof condition.value === "number" && value >= condition.value;
    case "lt": return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    case "lte": return typeof value === "number" && typeof condition.value === "number" && value <= condition.value;
    case "in": return Array.isArray(condition.value) && condition.value.includes(value);
    case "not_in": return Array.isArray(condition.value) && !condition.value.includes(value);
    case "contains": return typeof value === "string" && typeof condition.value === "string" && value.includes(condition.value);
    case "exists": return value !== undefined && value !== null;
    default: return false;
  }
}

export class InMemoryRepository<T extends BaseEntity> implements FullRepository<T> {
  protected data = new Map<string, T>();

  constructor(private readonly entityType: string, private readonly idFactory: () => string) {}

  private stamp(base: Partial<T>, existing?: T): T {
    const now = new Date().toISOString();
    return {
      status: "active",
      version: 1,
      isDeleted: false,
      ...existing,
      ...base,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    } as T;
  }

  async getById(id: string): Promise<T | null> {
    return this.data.get(id) ?? null;
  }

  async exists(id: string): Promise<boolean> {
    return this.data.has(id);
  }

  async count(query?: QueryObject): Promise<number> {
    if (!query) return this.data.size;
    return (await this.query({ ...query, page: 1, limit: Number.MAX_SAFE_INTEGER })).total;
  }

  /** Synchronous size probe (includes soft-deleted entries) — for registry/health-check callers that need a plain `number`, not a `Promise<number>`. */
  sizeSync(): number {
    return this.data.size;
  }

  async create(input: Partial<T>): Promise<T> {
    const id = (input as { id?: string }).id ?? this.idFactory();
    const entity = this.stamp({ ...input, id } as Partial<T>);
    this.data.set(id, entity);
    return { ...entity };
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) throw new Error(`${this.entityType} not found: ${id}`);
    const updated = this.stamp({ ...patch, id } as Partial<T>, existing);
    updated.version = (existing.version ?? 1) + 1;
    this.data.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  async softDelete(id: string): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) throw new Error(`${this.entityType} not found: ${id}`);
    const updated = { ...existing, isDeleted: true, deletedAt: new Date().toISOString(), status: "deleted" as const, updatedAt: new Date().toISOString() };
    this.data.set(id, updated);
    return { ...updated };
  }

  async restore(id: string): Promise<T> {
    const existing = this.data.get(id);
    if (!existing) throw new Error(`${this.entityType} not found: ${id}`);
    const updated = { ...existing, isDeleted: false, deletedAt: undefined, status: "restored" as const, updatedAt: new Date().toISOString() };
    this.data.set(id, updated);
    return { ...updated };
  }

  async purge(id: string): Promise<boolean> {
    const existing = this.data.get(id);
    if (!existing || !existing.isDeleted) return false;
    return this.data.delete(id);
  }

  async createMany(items: Partial<T>[]): Promise<T[]> {
    const created: T[] = [];
    for (const item of items) created.push(await this.create(item));
    return created;
  }

  async updateMany(ids: string[], patch: Partial<T>): Promise<number> {
    let updated = 0;
    for (const id of ids) {
      if (this.data.has(id)) {
        await this.update(id, patch);
        updated++;
      }
    }
    return updated;
  }

  async deleteMany(ids: string[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) if (this.data.delete(id)) deleted++;
    return deleted;
  }

  async getByIds(ids: string[]): Promise<T[]> {
    return ids.map(id => this.data.get(id)).filter((e): e is T => Boolean(e));
  }

  async findBySpecification(spec: Specification<T>): Promise<T[]> {
    return Array.from(this.data.values()).filter(entity => spec.isSatisfiedBy(entity));
  }

  async *stream(query: QueryObject, chunkSize = 100): AsyncGenerator<T[], void, void> {
    const all = await this.applyQuery(query);
    for (let i = 0; i < all.length; i += chunkSize) {
      yield all.slice(i, i + chunkSize);
    }
  }

  private async applyQuery(query: QueryObject): Promise<T[]> {
    let items = Array.from(this.data.values());

    if (!query.includeDeleted) items = items.filter(e => !e.isDeleted);

    if (query.scope) {
      if (query.scope.organizationId) items = items.filter(e => e.organizationId === query.scope!.organizationId);
      if (query.scope.workspaceId) items = items.filter(e => e.workspaceId === query.scope!.workspaceId);
      if (query.scope.brandId) items = items.filter(e => e.brandId === query.scope!.brandId);
    }

    if (query.filters) {
      for (const condition of query.filters) {
        items = items.filter(e => matchesFilter(e, condition));
      }
    }

    if (query.search) {
      const needle = query.search.toLowerCase();
      items = items.filter(e => JSON.stringify(e).toLowerCase().includes(needle));
    }

    if (query.sort) {
      for (const sortSpec of [...query.sort].reverse()) {
        items.sort((a, b) => {
          const av = getField(a, sortSpec.field);
          const bv = getField(b, sortSpec.field);
          if (av === bv) return 0;
          const cmp = (av as string | number) < (bv as string | number) ? -1 : 1;
          return sortSpec.direction === "asc" ? cmp : -cmp;
        });
      }
    }

    return items;
  }

  async query(query: QueryObject): Promise<PagedResult<T>> {
    const filtered = await this.applyQuery(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }
}
