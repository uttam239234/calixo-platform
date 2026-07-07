import { RESOURCE_HIERARCHY, type ResourceType } from "./types";

/**
 * Resource Hierarchy (section 5): Organization -> Workspace -> Brand ->
 * Campaign -> Asset -> Content -> Workflow -> Report -> Analytics -> AI ->
 * Connector -> Settings. A permission granted at an ancestor type cascades
 * down to every descendant type unless a more specific (denying) policy
 * says otherwise — `AuthorizationPlatformAPI` calls `cascades()` as an
 * additional grant path alongside the direct permission check.
 */
export class ResourceHierarchy {
  private readonly index = new Map<ResourceType, number>(RESOURCE_HIERARCHY.map((type, i) => [type, i]));

  getAncestorTypes(resourceType: ResourceType): ResourceType[] {
    const position = this.index.get(resourceType);
    if (position === undefined) return [];
    return RESOURCE_HIERARCHY.slice(0, position);
  }

  getDescendantTypes(resourceType: ResourceType): ResourceType[] {
    const position = this.index.get(resourceType);
    if (position === undefined) return [];
    return RESOURCE_HIERARCHY.slice(position + 1);
  }

  /** True if a grant at `grantedAt` should be honored for a request against `requestedType` (i.e. `grantedAt` is the same type or an ancestor of it). */
  cascades(grantedAt: ResourceType, requestedType: ResourceType): boolean {
    if (grantedAt === requestedType) return true;
    return this.getDescendantTypes(grantedAt).includes(requestedType);
  }
}

export const resourceHierarchy = new ResourceHierarchy();
