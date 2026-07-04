// Enterprise Module Framework
// Reusable components for all Calixo modules

export { ModuleHeader } from "./ModuleHeader";
export type { ModuleHeaderProps } from "./ModuleHeader";

export { ModuleDashboard } from "./ModuleDashboard";

export { ModuleTabs } from "./ModuleTabs";
export type { ModuleTab } from "./ModuleTabs";

export { ModuleKpiGrid } from "./KpiGrid";
export type { KpiItem } from "./KpiGrid";

export { QuickActionsBar } from "./QuickActionsBar";
export type { QuickAction, QuickActionItem } from "./QuickActionsBar";

export { EnterpriseDataTable } from "./EnterpriseDataTable";
export type {
  DataTableColumn,
  BulkAction,
  SavedView,
} from "./EnterpriseDataTable";

export { EnterpriseFilterBar } from "./EnterpriseFilterBar";
export type { FilterOption, FilterGroup } from "./EnterpriseFilterBar";

export { EnterpriseChartSection } from "./EnterpriseChartSection";

export { AIInsightPanel } from "./AIInsightPanel";
export type { AIInsight } from "./AIInsightPanel";

export { ActivityTimeline } from "./ActivityTimeline";
export type { ActivityItem } from "./ActivityTimeline";

export { NotificationPanel } from "./NotificationPanel";
export type { Notification } from "./NotificationPanel";

export { ModuleReportsToolbar } from "./ModuleReportsToolbar";

export { ModuleSettingsLayout } from "./ModuleSettingsLayout";
export type { SettingsSection } from "./ModuleSettingsLayout";

export { ModuleEmptyState } from "./EmptyState";

export { ModuleLoadingSkeleton } from "./LoadingSkeleton";

export { ModuleErrorState } from "./ErrorState";