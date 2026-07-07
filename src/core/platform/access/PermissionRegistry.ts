/**
 * Calixo Platform - Canonical Permission Registry
 *
 * The single source of truth for matrix-conformant permission strings
 * (`"{resourceType}:{action}"`) — "no custom permission naming" going
 * forward. Existing dot-notation permissions in `@/access/config/permissions`
 * (e.g. `"ads.create"`) are NOT migrated or duplicated — `AuthorizationEngine`
 * only ever does string-set membership checks, so both conventions coexist;
 * this registry is the canonical one for every NEW permission this platform
 * (or any future module) needs.
 */
import { ACTION_TYPES, FULL_RESOURCE_ORDER, type ActionType, type ResourceType } from "./types";

export function permissionName(resourceType: ResourceType, action: ActionType): string {
  return `${resourceType}:${action}`;
}

export function parsePermissionName(name: string): { resourceType: string; action: string } | null {
  const [resourceType, action] = name.split(":");
  if (!resourceType || !action) return null;
  return { resourceType, action };
}

/** Every resource type Authorization protects — the full conceptual order plus leaf-level types (`user`/`team`/`department`/`module`/`notification`/`billing`/`knowledge`/`media`/`file`/`dashboard`/`api`) that aren't part of the tenant-nesting cascade at all. */
const ALL_RESOURCE_TYPES: ResourceType[] = [...FULL_RESOURCE_ORDER, "user", "team", "department", "module", "notification", "billing", "knowledge", "media", "file", "dashboard", "api"];

export class PermissionRegistry {
  private readonly all: string[];
  private readonly byResource: Map<ResourceType, string[]>;

  constructor() {
    this.byResource = new Map();
    for (const resourceType of ALL_RESOURCE_TYPES) {
      this.byResource.set(resourceType, ACTION_TYPES.map(action => permissionName(resourceType, action)));
    }
    this.all = Array.from(this.byResource.values()).flat();
  }

  getAll(): string[] {
    return this.all;
  }

  forResource(resourceType: ResourceType): string[] {
    return this.byResource.get(resourceType) ?? [];
  }

  isValid(name: string): boolean {
    return this.all.includes(name);
  }

  count(): number {
    return this.all.length;
  }
}

export const permissionRegistry = new PermissionRegistry();
