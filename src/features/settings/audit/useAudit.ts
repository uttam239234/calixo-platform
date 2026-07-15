"use client";

/**
 * Calixo Audit Logs "Platform History Center" — data hook.
 * The only place allowed to call the audit/activity/versioning platform
 * APIs for this module — components never import them directly. Merges 4
 * real, independent sources (see `normalize.ts`'s doc comment) into one
 * feed, scoped to a single organization; separately surfaces Platform Admin
 * Logs and Restore Points for internal staff only (`useInternalRole()`).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { auditService } from "@/access/audit/AuditService";
import { activityEngine, userRegistry } from "@/core/users";
import { organizationPlatformAPI } from "@/core/platform/organizations";
import { workspacePlatformAPI } from "@/core/platform/workspaces";
import { useInternalRole } from "@/features/platform-admin/internalRole";
import { PLATFORM_ADMIN_ORG_SENTINEL } from "@/features/platform-admin/commitPlanChange";
import { fromAuditEvent, fromActivityEvent, fromOrganizationAuditEntry, fromWorkspaceAuditEntry, AUDIT_CATEGORIES, AUDIT_SEVERITIES, type AuditFeedItem, type AuditCategory, type AuditSeverity } from "./normalize";
import { enumerateRestorePoints, restoreEntityToVersion, type RestorePoint } from "./restoreSetters";

export type TimeRange = "today" | "7d" | "30d" | "all";

function withinRange(timestamp: string, range: TimeRange): boolean {
  if (range === "all") return true;
  const elapsed = Date.now() - new Date(timestamp).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return elapsed < day;
  if (range === "7d") return elapsed < 7 * day;
  return elapsed < 30 * day;
}

function lookupUserName(userId: string): string | undefined {
  return userRegistry.lookup(userId)?.displayName;
}

async function loadOrganizationFeed(organizationId: string): Promise<AuditFeedItem[]> {
  const auditEvents = await auditService.getOrganizationAuditLogs(organizationId);
  const activityEvents = activityEngine.recent(organizationId, 200);
  const orgTrail = organizationPlatformAPI.getAuditTrail(organizationId);
  const workspaces = workspacePlatformAPI.list({ organizationId });
  const workspaceTrail = workspaces.flatMap(w => workspacePlatformAPI.getAuditTrail(w.id));

  return [
    ...auditEvents.map(e => fromAuditEvent(e, lookupUserName)),
    ...activityEvents.map(e => fromActivityEvent(e, lookupUserName)),
    ...orgTrail.map(e => fromOrganizationAuditEntry(e, lookupUserName)),
    ...workspaceTrail.map(e => fromWorkspaceAuditEntry(e, lookupUserName)),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function useAudit(organizationId: string) {
  const { role, isInternalStaff } = useInternalRole();
  const [items, setItems] = useState<AuditFeedItem[]>([]);
  const [platformAdminItems, setPlatformAdminItems] = useState<AuditFeedItem[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Set<AuditCategory>>(new Set());
  const [severityFilters, setSeverityFilters] = useState<Set<AuditSeverity>>(new Set());
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    setItems(await loadOrganizationFeed(organizationId));

    if (isInternalStaff) {
      const platformAdminEvents = await auditService.getOrganizationAuditLogs(PLATFORM_ADMIN_ORG_SENTINEL);
      setPlatformAdminItems(platformAdminEvents.map(e => fromAuditEvent(e, lookupUserName)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      setRestorePoints(enumerateRestorePoints());
    } else {
      setPlatformAdminItems([]);
      setRestorePoints([]);
    }
    setLoading(false);
  }, [organizationId, isInternalStaff]);

  useEffect(() => {
    (async () => {
      await refresh();
    })();
  }, [refresh]);

  const toggleCategory = useCallback((category: AuditCategory) => {
    setCategoryFilters(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const toggleSeverity = useCallback((severity: AuditSeverity) => {
    setSeverityFilters(prev => {
      const next = new Set(prev);
      if (next.has(severity)) next.delete(severity);
      else next.add(severity);
      return next;
    });
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => {
      if (categoryFilters.size > 0 && !categoryFilters.has(item.category)) return false;
      if (severityFilters.size > 0 && !severityFilters.has(item.severity)) return false;
      if (!withinRange(item.timestamp, timeRange)) return false;
      if (query && !`${item.actorLabel} ${item.description} ${item.category}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, categoryFilters, severityFilters, timeRange, search]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return items.filter(item => `${item.actorLabel} ${item.description} ${item.category}`.toLowerCase().includes(query));
  }, [items, search]);

  const changeHistory = useMemo(() => items.filter(item => item.changes !== undefined), [items]);

  const restore = useCallback(
    (point: RestorePoint) => {
      if (!point.canRestore || point.restoreToVersion === undefined) return false;
      const ok = restoreEntityToVersion(point.entityType, point.entityId, point.restoreToVersion, role);
      if (ok) void refresh();
      return ok;
    },
    [role, refresh]
  );

  return {
    loading,
    items,
    filteredItems,
    searchResults,
    changeHistory,
    platformAdminItems,
    restorePoints,
    isInternalStaff,
    search,
    setSearch,
    categoryFilters,
    toggleCategory,
    severityFilters,
    toggleSeverity,
    timeRange,
    setTimeRange,
    restore,
    refresh,
    categories: AUDIT_CATEGORIES,
    severities: AUDIT_SEVERITIES,
  };
}

export type UseAuditResult = ReturnType<typeof useAudit>;
