"use server";

/**
 * Calixo Platform - Analytics Layout Server Actions
 *
 * Mirrors `features/dashboard/layoutActions.ts` exactly — same shared
 * `createLayoutController`, same actor-resolution rules (see that file's
 * header for the `workspaceId` disclosure). Proves the Round 23 platform
 * is genuinely reusable across modules, not Dashboard-specific.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService, authorizationPlatformAPI, type EntitlementModuleId } from "@/core/platform/access";
import type { DashboardLayoutActor, DashboardLayoutTemplateVisibility } from "@/core/platform/dashboardBuilder";
import { createLayoutController } from "@/core/platform/dashboardBuilder/serverActions";
import { analyticsDashboardRegistry } from "@/core/analytics/dashboards/AnalyticsDashboardRegistry";
import { seedAnalyticsDashboards } from "@/core/analytics/dashboards/seedAnalyticsDashboards";
import { ANALYTICS_WIDGET_CATALOG } from "@/core/analytics/dashboards/types";
import type { AnalyticsWidgetCatalogEntry, AnalyticsWidgetConfig, AnalyticsWidgetKey } from "@/core/analytics/dashboards/types";

async function filterWidget(actor: DashboardLayoutActor, entry: AnalyticsWidgetCatalogEntry): Promise<boolean> {
  if (entry.requiresModule) {
    const decision = await entitlementService.canAccessModule(actor, entry.requiresModule as EntitlementModuleId);
    if (!decision.allowed) return false;
  }
  if (entry.requiresPermission) {
    const permissions = await authorizationPlatformAPI.getEffectivePermissions(actor.userId, actor.organizationId);
    if (!permissions.includes(entry.requiresPermission)) return false;
  }
  return true;
}

const controller = createLayoutController<AnalyticsWidgetKey, AnalyticsWidgetCatalogEntry>({
  registry: analyticsDashboardRegistry,
  moduleId: "analytics",
  catalog: ANALYTICS_WIDGET_CATALOG,
  filterWidget,
});

async function requireActor(workspaceId?: string): Promise<DashboardLayoutActor> {
  const identity = await resolveIdentity();
  if (!identity) throw new Error("Not authenticated");
  return { userId: identity.userId, organizationId: identity.organizationId, workspaceId };
}

export async function getAnalyticsLayoutStateAction(preferredLayoutId?: string, workspaceId?: string) {
  seedAnalyticsDashboards();
  const actor = await requireActor(workspaceId);
  return controller.getState(actor, preferredLayoutId);
}

export async function listAnalyticsWidgetCatalogAction(workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.listWidgetCatalog(actor);
}

export async function switchAnalyticsLayoutAction(layoutId: string, workspaceId?: string) {
  seedAnalyticsDashboards();
  const actor = await requireActor(workspaceId);
  return controller.switchTo(actor, layoutId);
}

export async function createAnalyticsLayoutAction(name: string, description: string, templateId?: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.create(actor, name, description, templateId);
}

export async function cloneAnalyticsLayoutAction(sourceId: string, name: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.clone(actor, sourceId, name);
}

export async function renameAnalyticsLayoutAction(id: string, name: string) {
  return controller.rename(id, name);
}

export async function removeAnalyticsLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.remove(actor, id);
}

export async function toggleAnalyticsLayoutFavoriteAction(id: string, favorite: boolean) {
  return controller.toggleFavorite(id, favorite);
}

export async function setDefaultAnalyticsLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  await controller.setDefault(actor, id);
}

export async function saveAnalyticsLayoutAsTemplateAction(sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.saveAsTemplate(actor, sourceId, name, visibility);
}

export async function resetAnalyticsLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.resetLayout(actor, id);
}

export async function resetAnalyticsWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.resetWidget(actor, layoutId, instanceId);
}

export async function updateAnalyticsWidgetsAction(layoutId: string, widgets: AnalyticsWidgetConfig[], workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.updateWidgets(actor, layoutId, widgets);
}

export async function addAnalyticsWidgetAction(layoutId: string, key: AnalyticsWidgetKey, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.addWidget(actor, layoutId, key);
}

export async function removeAnalyticsWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.removeWidget(actor, layoutId, instanceId);
}

export async function duplicateAnalyticsWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.duplicateWidget(actor, layoutId, instanceId);
}
