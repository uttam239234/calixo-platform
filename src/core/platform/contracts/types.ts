/**
 * Calixo Platform - Shared Contracts (Platform-Wide)
 *
 * The standardized summary shapes for every module NOT already covered by
 * its own `platform/contracts.ts` (Analytics has its own — see
 * `@/core/analytics/platform/contracts` — and Brand has its own — see
 * `@/core/brand/platform/contracts`; both are re-exported from
 * `../contracts/index.ts` so this is genuinely the ONE barrel to import
 * from, per the mandate: "No module should directly import another
 * module's engine.").
 *
 * These are declared here (rather than inside each module) for the
 * modules whose engines predate this Platform Foundation phase and don't
 * yet have their own `platform/` folder — a facade for each is added in
 * this phase (`AssetsPlatformAPI`, `WorkflowPlatformAPI`,
 * `ReportsPlatformAPI`, `SettingsPlatformAPI`, `UsersPlatformAPI`,
 * `NotificationsPlatformAPI`, `ConnectorsPlatformAPI`).
 */
import type { Organization } from "../organizations/types";
import type { Workspace } from "../workspaces/types";
import type { Subscription } from "../subscription/types";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: Organization["status"];
  tier: Organization["tier"];
  memberCount: number;
}

export interface WorkspaceSummary {
  id: string;
  organizationId: string;
  name: string;
  type: Workspace["type"];
  memberCount: number;
}

export interface SubscriptionSummary {
  organizationId: string;
  tier: Subscription["tier"];
  status: Subscription["status"];
  seatsUsed: number;
  seatsLimit: number;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
}

export interface UserSummary {
  id: string;
  displayName: string;
  email: string;
  status: string;
  workspaceId: string;
}

export interface AssetSummary {
  id: string;
  name: string;
  type: string;
  brand?: string;
  approvalStatus: string;
}

export interface WorkflowSummary {
  pending: number;
  overdue: number;
  approved: number;
  avgApprovalDays: number;
}

export interface ReportSummary {
  id: string;
  name: string;
  category: string;
  lastRunAt?: string;
}

export interface NotificationSummary {
  unreadCount: number;
  recent: { id: string; title: string; createdAt: string }[];
}

export interface ConnectorSummary {
  id: string;
  providerId: string;
  name: string;
  status: string;
  lastSyncAt?: string;
  /** Additive — omitted when the underlying connection has no health snapshot yet. */
  health?: {
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    failureCount: number;
    successRate: number;
    lastErrorMessage?: string;
  };
  /** OAuth2 access-token expiry, when the connection's auth type is OAuth2. */
  tokenExpiresAt?: string;
}

export interface SettingsSummary {
  groupId: string;
  groupLabel: string;
  settingCount: number;
}
