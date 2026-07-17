/**
 * Calixo Platform - Generic Dashboard-Builder Platform
 *
 * Extracted from the Dashboard module's own layout system so any module
 * (Dashboard, Analytics, and future ones) can offer named, persona-based
 * layouts with real create/clone/rename/delete/favourite/default/switch/
 * reset-to-template semantics WITHOUT re-implementing the same registry.
 * Parameterized by the module's own widget-key union — this file owns no
 * module-specific widget catalog or seed data.
 *
 * Round 23 ("Adaptive Workspace OS"): added real spatial grid position
 * (`WidgetGridPosition`), multi-instance support (`instanceId`, for
 * "Duplicate"), collapse state, and a genuine organization/workspace/user
 * ownership hierarchy (`scope`/`organizationId`/`workspaceId`) — layouts
 * were previously partitioned only by a free-text `owner` display name with
 * no tenant isolation at all (every organization shared one global pool).
 */

export interface WidgetGridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardWidgetConfig<TKey extends string = string> {
  key: TKey;
  /** Unique per placed widget. Defaults to `key` for the first/only instance; a fresh id for each "Duplicate". */
  instanceId: string;
  visible: boolean;
  pinned: boolean;
  collapsed: boolean;
  order: number;
  layout: WidgetGridPosition;
}

/** Who a layout belongs to, in priority order when resolving a user's active layout: user > workspace > organization > system. */
export type DashboardLayoutScope = "system" | "organization" | "workspace" | "user";

/** Who a saved template is visible to when offered as a clone-source in the switcher. */
export type DashboardLayoutTemplateVisibility = "private" | "workspace" | "organization";

export interface DashboardLayout<TKey extends string = string> {
  id: string;
  name: string;
  description: string;
  persona: string;
  widgets: DashboardWidgetConfig<TKey>[];
  /** Real id of the owning entity: a userId (scope="user"), a workspaceId (scope="workspace"), an organizationId (scope="organization"), or "system" (scope="system"). Never a display name. */
  owner: string;
  scope: DashboardLayoutScope;
  /** "system" for the global built-in templates; a real organization id otherwise. Layouts never leak across organizations. */
  organizationId: string;
  /** Only set when scope === "workspace". */
  workspaceId?: string;
  isDefault: boolean;
  isFavorite: boolean;
  isTemplate: boolean;
  /** Only meaningful when isTemplate === true — private templates are clone-sources for their owner only. */
  templateVisibility?: DashboardLayoutTemplateVisibility;
  /** The template this layout was created/materialized from, if any — lets "Reset Widget"/"Reset Page" restore against the layout's own lineage rather than always falling back to the module's bare default set. */
  sourceTemplateId?: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidgetCatalogEntry<TKey extends string = string> {
  key: TKey;
  label: string;
  description: string;
  group: string;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  /** Widget disappears entirely (both in the Add Widget menu and the grid) unless the actor's plan includes this module. Loosely typed as `string` here to avoid this generic SDK depending on `EntitlementModuleId` — callers pass the real union value. */
  requiresModule?: string;
  /** Widget disappears unless the actor holds this permission — a `permissionName()`-shaped string, checked the same way `DASHBOARD_WIDGET_PERMISSIONS` already is. */
  requiresPermission?: string;
  /** Widgets users can't remove entirely from their own dashboard (e.g. AI Copilot, Credit Balance) — still hideable/movable, matching the brief's own "pinned widgets always stay visible" examples at the catalog level. */
  alwaysAvailable?: boolean;
}

/** The actor a layout is being resolved or mutated for — always real, server-verified ids, never a display name. */
export interface DashboardLayoutActor {
  userId: string;
  organizationId: string;
  workspaceId?: string;
}
