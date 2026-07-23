/**
 * Calixo Platform - Platform Event Catalog
 *
 * The fixed set of typed events every Calixo module should PUBLISH to
 * instead of calling into another module's engine directly. This is the
 * "event-driven" seam the platform mandate requires: a module that wants
 * to react to another module's lifecycle (e.g. Notifications reacting to
 * `WorkflowCompleted`) subscribes to a type below rather than importing
 * that module's engine.
 */

export type PlatformEventType =
  | "OrganizationCreated"
  | "OrganizationUpdated"
  | "OrganizationArchived"
  | "WorkspaceCreated"
  | "WorkspaceUpdated"
  | "WorkspaceArchived"
  | "BrandCreated"
  | "BrandUpdated"
  | "UserInvited"
  | "UserJoined"
  | "InvitationAccepted"
  | "MemberRoleChanged"
  | "ConnectorConnected"
  | "ConnectorDisconnected"
  | "WorkflowCompleted"
  | "ContentPublished"
  | "CampaignLaunched"
  | "AnalyticsUpdated"
  | "AICompleted"
  | "SubscriptionChanged"
  | "FeatureFlagChanged"
  | "LimitExceeded"
  // Authentication & Identity Platform (Track 1 Phase 2)
  | "UserLoggedIn"
  | "UserLoggedOut"
  | "PasswordChanged"
  | "PasswordReset"
  | "SessionCreated"
  | "SessionExpired"
  | "SessionRevoked"
  | "ProfileUpdated"
  | "AccountLocked"
  | "SecurityAlert"
  // Enterprise Access Control Platform (Track 1 Phase 3)
  | "RoleAssigned"
  | "RoleRemoved"
  | "PermissionGranted"
  | "PermissionRevoked"
  | "PolicyCreated"
  | "PolicyUpdated"
  | "PolicyDeleted"
  | "AccessGranted"
  | "AccessDenied"
  | "AuthorizationSucceeded"
  | "AuthorizationFailed"
  // Enterprise Data & Persistence Platform (Track 1 Phase 4)
  | "EntityCreated"
  | "EntityUpdated"
  | "EntityDeleted"
  | "EntityRestored"
  | "EntityVersionCreated"
  | "TransactionCommitted"
  | "TransactionRolledBack"
  | "CacheInvalidated"
  | "SearchIndexed"
  // Enterprise Integration & Connector Platform (Track 1 Phase 5) — "ConnectorConnected"/"ConnectorDisconnected" already existed above (Phase 1).
  | "ConnectorInstalled"
  | "ConnectorUninstalled"
  | "ConnectorSyncCompleted"
  | "ConnectorSyncFailed"
  | "ConnectorHealthChanged"
  | "WebhookReceived"
  | "WebhookDelivered"
  | "SecretRotated"
  // Universal Connector Framework (Track 1 Phase 5 extension) — additive.
  | "ConnectorTokenRefreshed"
  | "ConnectorPermissionsChanged"
  // Enterprise API, Gateway & Developer Platform (Track 1 Phase 6)
  | "ApiKeyCreated"
  | "ApiKeyRevoked"
  | "OAuthAppRegistered"
  | "ContractRegistered"
  | "ContractDeprecated"
  | "RateLimitExceeded"
  // Enterprise Execution, Automation & Background Processing Platform (Track 1 Phase 7)
  | "ExecutionCreated"
  | "ExecutionCompleted"
  | "ExecutionFailed"
  | "ExecutionRetried"
  | "ExecutionCancelled"
  | "AutomationTriggered"
  // Enterprise Observability, Monitoring, Diagnostics & Operations Platform (Track 1 Phase 8)
  | "AlertFired"
  | "AlertResolved"
  // Enterprise Commercial, Billing, Licensing & Subscription Platform (Track 1 Phase 9) —
  // "SubscriptionChanged" already existed above (Phase 1).
  | "SubscriptionCreated"
  | "SubscriptionRenewed"
  | "SubscriptionCancelled"
  | "SubscriptionExpired"
  | "PlanChanged"
  | "LicenseAssigned"
  | "LicenseRevoked"
  | "QuotaExceeded"
  | "QuotaWarning"
  | "CreditConsumed"
  | "CreditAdded"
  | "InvoiceGenerated"
  | "PaymentReceived"
  | "PaymentFailed"
  | "UsageRecorded"
  | "EntitlementChanged"
  | "PromotionRedeemed"
  | "ContractSigned";

/** Minimal tenant addressing carried on every platform event, mirroring `@/background/types`' `Event.organizationId/workspaceId/userId`. */
export interface PlatformEventTenant {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
}

export interface PlatformEventInput<TPayload = Record<string, unknown>> extends PlatformEventTenant {
  type: PlatformEventType;
  payload: TPayload;
  correlationId?: string;
}
