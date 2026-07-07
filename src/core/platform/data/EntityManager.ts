/**
 * Calixo Platform - Entity Manager
 *
 * The composition point that ties a resolved repository (from
 * `RepositoryRegistry`) together with auditing (reusing the Access Control
 * Platform's `auditService.recordEvent()` — no new audit sink invented),
 * platform events (`PlatformEventBus`), and versioning (`VersioningEngine`)
 * for every entity lifecycle transition. This is what "every module accesses
 * data through repositories" becomes concrete: call `entityManager.create()`
 * instead of touching a Map directly.
 */
import { auditService } from "@/access/audit/AuditService";
import { platformEventBus } from "../events/PlatformEventBus";
import type { BaseEntity } from "./types";
import { repositoryRegistry } from "./RepositoryRegistry";
import { versioningEngine } from "./VersioningEngine";

export interface EntityActor {
  userId: string;
  organizationId?: string;
  workspaceId?: string;
}

export class EntityManager {
  async create<T extends BaseEntity>(entityType: string, data: Partial<T>, actor: EntityActor): Promise<T> {
    const repo = repositoryRegistry.resolve<T>(entityType);
    const entity = await repo.create({ ...data, createdBy: actor.userId, updatedBy: actor.userId } as Partial<T>);

    await versioningEngine.snapshot(entityType, entity.id, entity, actor.userId, "created");
    await this.audit(entityType, "entity_created", entity.id, actor, `${entityType} ${entity.id} created`);
    await platformEventBus.publish({
      type: "EntityCreated",
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      payload: { entityType, entityId: entity.id },
    });
    return entity;
  }

  async update<T extends BaseEntity>(entityType: string, id: string, patch: Partial<T>, actor: EntityActor): Promise<T> {
    const repo = repositoryRegistry.resolve<T>(entityType);
    const entity = await repo.update(id, { ...patch, updatedBy: actor.userId } as Partial<T>);

    await versioningEngine.snapshot(entityType, entity.id, entity, actor.userId, "updated");
    await this.audit(entityType, "entity_updated", id, actor, `${entityType} ${id} updated`);
    await platformEventBus.publish({
      type: "EntityUpdated",
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      payload: { entityType, entityId: id, version: entity.version },
    });
    return entity;
  }

  async softDelete<T extends BaseEntity>(entityType: string, id: string, actor: EntityActor): Promise<T> {
    const repo = repositoryRegistry.resolve<T>(entityType);
    const entity = await repo.softDelete(id);

    await this.audit(entityType, "entity_deleted", id, actor, `${entityType} ${id} soft-deleted`);
    await platformEventBus.publish({
      type: "EntityDeleted",
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      payload: { entityType, entityId: id },
    });
    return entity;
  }

  async restore<T extends BaseEntity>(entityType: string, id: string, actor: EntityActor): Promise<T> {
    const repo = repositoryRegistry.resolve<T>(entityType);
    const entity = await repo.restore(id);

    await this.audit(entityType, "entity_restored", id, actor, `${entityType} ${id} restored`);
    await platformEventBus.publish({
      type: "EntityRestored",
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      payload: { entityType, entityId: id },
    });
    return entity;
  }

  private async audit(entityType: string, eventType: "entity_created" | "entity_updated" | "entity_deleted" | "entity_restored", resourceId: string, actor: EntityActor, description: string): Promise<void> {
    await auditService.recordEvent({
      organizationId: actor.organizationId,
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      eventType,
      resource: entityType,
      resourceId,
      description,
    });
  }
}

export const entityManager = new EntityManager();
