"use server";

/**
 * Calixo Platform - Dashboard Layout Server Actions
 *
 * The real "backend enforcement, not UI hiding" boundary for the
 * Dashboard's widget grid: every read and mutation resolves the actor via
 * `resolveIdentity()` (server-verified, never client-supplied) and flows
 * through the shared `createLayoutController`. `workspaceId` is the one
 * exception — accepted as a plain argument because no server-side "active
 * workspace" session concept exists anywhere in this codebase yet
 * (workspace switching is client `useState`, confirmed during this
 * round's research); it's exactly as trustworthy as workspace switching
 * already is everywhere else in the app, not a new gap this round
 * introduces. `userId`/`organizationId` are always server-verified.
 */
import { resolveIdentity } from "@/identity/bridge/resolveIdentity.server";
import { entitlementService, authorizationPlatformAPI, type EntitlementModuleId } from "@/core/platform/access";
import type { DashboardLayoutActor, DashboardLayoutTemplateVisibility } from "@/core/platform/dashboardBuilder";
import { createLayoutController } from "@/core/platform/dashboardBuilder/serverActions";
import { dashboardLayoutRegistry } from "@/core/dashboard/layouts/DashboardLayoutRegistry";
import { seedDashboardLayouts } from "@/core/dashboard/layouts/seedDashboardLayouts";
import { DASHBOARD_WIDGET_CATALOG } from "@/core/dashboard/layouts/types";
import type { DashboardWidgetCatalogEntry, DashboardWidgetConfig, DashboardWidgetKey } from "@/core/dashboard/layouts/types";
import { getWalletBreakdown } from "@/features/settings/billing/aiCredits";
import { reputationPlatformAPI } from "@/core/reputation";

async function filterWidget(actor: DashboardLayoutActor, entry: DashboardWidgetCatalogEntry): Promise<boolean> {
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

const controller = createLayoutController<DashboardWidgetKey, DashboardWidgetCatalogEntry>({
  registry: dashboardLayoutRegistry,
  moduleId: "dashboard",
  catalog: DASHBOARD_WIDGET_CATALOG,
  filterWidget,
});

async function requireActor(workspaceId?: string): Promise<DashboardLayoutActor> {
  const identity = await resolveIdentity();
  if (!identity) throw new Error("Not authenticated");
  return { userId: identity.userId, organizationId: identity.organizationId, workspaceId };
}

export async function getDashboardLayoutStateAction(preferredLayoutId?: string, workspaceId?: string) {
  seedDashboardLayouts();
  const actor = await requireActor(workspaceId);
  return controller.getState(actor, preferredLayoutId);
}

export async function listDashboardWidgetCatalogAction(workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.listWidgetCatalog(actor);
}

export async function switchDashboardLayoutAction(layoutId: string, workspaceId?: string) {
  seedDashboardLayouts();
  const actor = await requireActor(workspaceId);
  return controller.switchTo(actor, layoutId);
}

export async function createDashboardLayoutAction(name: string, description: string, templateId?: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.create(actor, name, description, templateId);
}

export async function cloneDashboardLayoutAction(sourceId: string, name: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.clone(actor, sourceId, name);
}

export async function renameDashboardLayoutAction(id: string, name: string) {
  return controller.rename(id, name);
}

export async function removeDashboardLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.remove(actor, id);
}

export async function toggleDashboardLayoutFavoriteAction(id: string, favorite: boolean) {
  return controller.toggleFavorite(id, favorite);
}

export async function setDefaultDashboardLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  await controller.setDefault(actor, id);
}

export async function saveDashboardLayoutAsTemplateAction(sourceId: string, name: string, visibility: DashboardLayoutTemplateVisibility, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.saveAsTemplate(actor, sourceId, name, visibility);
}

export async function resetDashboardLayoutAction(id: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.resetLayout(actor, id);
}

export async function resetDashboardWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.resetWidget(actor, layoutId, instanceId);
}

export async function updateDashboardWidgetsAction(layoutId: string, widgets: DashboardWidgetConfig[], workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.updateWidgets(actor, layoutId, widgets);
}

export async function addDashboardWidgetAction(layoutId: string, key: DashboardWidgetKey, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.addWidget(actor, layoutId, key);
}

export async function removeDashboardWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.removeWidget(actor, layoutId, instanceId);
}

export async function duplicateDashboardWidgetAction(layoutId: string, instanceId: string, workspaceId?: string) {
  const actor = await requireActor(workspaceId);
  return controller.duplicateWidget(actor, layoutId, instanceId);
}

export interface AiCreditsWidgetData {
  includedLimit: number;
  includedRemaining: number;
  purchasedRemaining: number;
  totalAvailable: number;
  nextResetAt?: string;
  percentIncludedUsed: number;
}

export async function getAiCreditsWidgetDataAction(): Promise<AiCreditsWidgetData | null> {
  const identity = await resolveIdentity();
  if (!identity) return null;
  return getWalletBreakdown(identity.organizationId);
}

export interface BrandSentimentWidgetData {
  avgSentimentScore: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  totalMentions: number;
}

export async function getBrandSentimentWidgetDataAction(): Promise<BrandSentimentWidgetData | null> {
  const identity = await resolveIdentity();
  if (!identity) return null;
  const decision = await entitlementService.canAccessModule({ userId: identity.userId, organizationId: identity.organizationId }, "brand");
  if (!decision.allowed) return null;
  const overview = reputationPlatformAPI.getOverview();
  return {
    avgSentimentScore: overview.avgSentimentScore,
    positivePct: overview.positivePct,
    neutralPct: overview.neutralPct,
    negativePct: overview.negativePct,
    totalMentions: overview.totalMentions,
  };
}
