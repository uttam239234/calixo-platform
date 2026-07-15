/**
 * Calixo Platform - Core Commercial Wiring
 *
 * The one file allowed to import multiple modules (mirrors Phase 6/7/8's
 * `registerCoreContracts.ts`/`registerCoreExecutionWiring.ts`/
 * `registerCoreObservabilityWiring.ts` convention). Satisfies mandate
 * sections 21-24 (AI/Connector/API/Execution Commercial Integration)
 * WITHOUT adding new instrumentation to any of those four already-complete
 * phases:
 *
 * - Connector and Execution usage are recorded from the real
 *   `ConnectorSyncCompleted`/`ExecutionCompleted` events Phases 5 and 7
 *   already publish — event-driven, no polling, no double-counting.
 * - AI and API usage are recorded from a real recurring "commercial-tick"
 *   job (via Phase 7's Execution Platform, not a new poller) that reads
 *   only NEW records since the last sweep from `aiAnalytics`/
 *   `apiAnalyticsEngine` (a `getRecordsSince()` accessor was added to the
 *   latter — additive, mirrors the `QueueEngine.getJob()`/
 *   `CacheEngine.allStats()` precedent from Phases 7/8).
 */
import { workerPlatformAPI } from "@/core/platform/execution/WorkerPlatformAPI";
import { schedulerPlatformAPI } from "@/core/platform/execution/SchedulerPlatformAPI";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import type { Event as BackgroundEvent, WorkerHandler } from "@/background/types";
import { organizationRegistry } from "@/core/platform/organizations/OrganizationRegistry";
import { aiAnalytics } from "@/aios/analytics/AIAnalytics";
import { apiAnalyticsEngine } from "@/core/platform/api/ApiAnalyticsEngine";
import { subscriptionEngine } from "@/core/platform/subscription/SubscriptionEngine";
import { usageMeteringEngine } from "../UsageMeteringEngine";
import { quotaEngine } from "../QuotaEngine";
import { pricingEngine } from "../PricingEngine";
import { creditEngine } from "../CreditEngine";
import { creditPackEngine } from "../CreditPackEngine";
import { featureFlagRegistry } from "@/core/platform/featureFlags";
import type { UsageTypeDefinition } from "../types";

let registered = false;
let lastAiSync = new Date(0).toISOString();
let lastApiSync = new Date(0).toISOString();

export function registerCoreCommercialWiring(): void {
  if (registered) return;
  registered = true;

  registerUsageTypes();
  registerDefaultQuotas();
  registerDefaultPricing();
  registerDefaultCreditPacks();
  registerExperimentFlags();
  registerEventDrivenUsage();
  registerCommercialTick();
}

const USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "users", name: "Users", description: "Active user seats.", unit: "user", category: "core", owner: "platform-team" },
  { id: "organizations", name: "Organizations", description: "Organizations under management.", unit: "organization", category: "core", owner: "platform-team" },
  { id: "workspaces", name: "Workspaces", description: "Active workspaces.", unit: "workspace", category: "core", owner: "platform-team" },
  { id: "storage", name: "Storage", description: "Stored data.", unit: "GB", category: "core", owner: "platform-team" },
  { id: "assets", name: "Assets", description: "Managed media assets.", unit: "asset", category: "core", owner: "platform-team" },
  { id: "api_calls", name: "API Calls", description: "Gateway requests processed.", unit: "request", category: "api", owner: "platform-team" },
  { id: "ai_requests", name: "AI Requests", description: "AI Gateway calls.", unit: "request", category: "ai", owner: "platform-team" },
  { id: "ai_tokens", name: "AI Tokens", description: "Prompt + completion tokens consumed.", unit: "token", category: "ai", owner: "platform-team" },
  { id: "reports", name: "Reports", description: "Reports generated.", unit: "report", category: "core", owner: "platform-team" },
  { id: "exports", name: "Exports", description: "Report/data exports.", unit: "export", category: "core", owner: "platform-team" },
  { id: "executions", name: "Executions", description: "Background executions processed.", unit: "execution", category: "execution", owner: "platform-team" },
  { id: "connector_syncs", name: "Connector Syncs", description: "Connector synchronization runs.", unit: "sync", category: "connector", owner: "platform-team" },
  { id: "connector_api_calls", name: "Connector API Calls", description: "Outbound calls made to third-party connector APIs.", unit: "request", category: "connector", owner: "platform-team" },
  { id: "scheduled_jobs", name: "Scheduled Jobs", description: "Recurring/scheduled job runs.", unit: "job", category: "execution", owner: "platform-team" },
  { id: "emails", name: "Emails", description: "Emails sent.", unit: "email", category: "communication", owner: "platform-team" },
  { id: "sms", name: "SMS", description: "SMS messages sent.", unit: "message", category: "communication", owner: "platform-team" },
  { id: "whatsapp", name: "WhatsApp", description: "WhatsApp messages sent.", unit: "message", category: "communication", owner: "platform-team" },
  { id: "push_notifications", name: "Push Notifications", description: "Push notifications delivered.", unit: "notification", category: "communication", owner: "platform-team" },
  { id: "social_posts", name: "Social Posts", description: "Social posts published.", unit: "post", category: "content", owner: "platform-team" },
  { id: "content_generation", name: "Content Generation", description: "AI content generations.", unit: "generation", category: "content", owner: "platform-team" },
  { id: "seo_crawls", name: "SEO Crawls", description: "SEO crawl runs.", unit: "crawl", category: "content", owner: "platform-team" },
  { id: "brand_monitoring", name: "Brand Monitoring", description: "Brand mentions tracked.", unit: "mention", category: "content", owner: "platform-team" },
  { id: "crm_records", name: "CRM Records", description: "CRM records stored.", unit: "record", category: "crm", owner: "platform-team" },
  { id: "lead_records", name: "Lead Records", description: "Lead records captured.", unit: "record", category: "crm", owner: "platform-team" },
];

function registerUsageTypes(): void {
  for (const type of USAGE_TYPES) usageMeteringEngine.registerType(type);
}

function registerDefaultQuotas(): void {
  quotaEngine.register({ id: "ai-requests-starter", usageTypeId: "ai_requests", scope: "organization", kind: "hard", limit: 2000, period: "monthly", warningThresholdPercent: 80, graceUsagePercent: 5, tier: "starter" });
  quotaEngine.register({ id: "ai-requests-growth", usageTypeId: "ai_requests", scope: "organization", kind: "hard", limit: 10000, period: "monthly", warningThresholdPercent: 80, graceUsagePercent: 10, tier: "growth" });
  quotaEngine.register({ id: "ai-requests-enterprise", usageTypeId: "ai_requests", scope: "organization", kind: "soft", limit: 100000, period: "monthly", warningThresholdPercent: 90, graceUsagePercent: 25, tier: "enterprise" });
  quotaEngine.register({ id: "api-calls-default", usageTypeId: "api_calls", scope: "organization", kind: "hard", limit: 100000, period: "daily", warningThresholdPercent: 80, graceUsagePercent: 10 });
  quotaEngine.register({ id: "executions-default", usageTypeId: "executions", scope: "organization", kind: "hard", limit: 5000, period: "daily", warningThresholdPercent: 80, graceUsagePercent: 10 });
  quotaEngine.register({ id: "connector-syncs-default", usageTypeId: "connector_syncs", scope: "organization", kind: "soft", limit: 1000, period: "daily", warningThresholdPercent: 90, graceUsagePercent: 0 });
}

/**
 * Round 21: Enterprise is a real, self-serve flat-priced tier — NOT
 * `model: "quote"` — so it's editable from the Platform Admin Console
 * exactly like Starter/Growth (`app/platform-admin/pricing`), and Billing/
 * Upgrade Center/Checkout/`SubscriptionEngine` all read it through the same
 * generic `pricingPlatformAPI.quote()` path, no tier-specific branch. These
 * are seed defaults only — every real price a customer ever sees comes from
 * whatever a Platform Admin has saved into this same registry since.
 */
function registerDefaultPricing(): void {
  pricingEngine.registerRule({ id: "price-trial", tier: "trial", model: "flat", monthlyPrice: 0, annualPrice: 0, currency: "USD" });
  pricingEngine.registerRule({ id: "price-starter", tier: "starter", model: "flat", monthlyPrice: 49, annualPrice: 490, currency: "USD" });
  pricingEngine.registerRule({ id: "price-growth", tier: "growth", model: "flat", monthlyPrice: 199, annualPrice: 1990, currency: "USD" });
  pricingEngine.registerRule({ id: "price-enterprise", tier: "enterprise", model: "flat", monthlyPrice: 999, annualPrice: 9990, currency: "USD" });
}

/** The 5 locked AI credit packs — the Internal Plan Management Console's Section 2 catalog, and the single source of truth `BuyCreditsDialog`/checkout read from. */
function registerDefaultCreditPacks(): void {
  creditPackEngine.register({ id: "pack-5", price: 5, credits: 500, isActive: true, order: 1 });
  creditPackEngine.register({ id: "pack-10", price: 10, credits: 1000, isActive: true, order: 2 });
  creditPackEngine.register({ id: "pack-20", price: 20, credits: 2500, isActive: true, order: 3 });
  creditPackEngine.register({ id: "pack-50", price: 50, credits: 6000, isActive: true, order: 4 });
  creditPackEngine.register({ id: "pack-100", price: 100, credits: 15000, isActive: true, order: 5 });
}

/** Example percentage-rollout experiments for the Internal Plan Management Console's Section 7 — `rolloutPercent: 0` until a Platform Admin dials one up. */
function registerExperimentFlags(): void {
  featureFlagRegistry.register({ id: "experiment-new-dashboard", label: "New Dashboard", description: "Redesigned dashboard layout and widgets.", defaultEnabled: false, category: "experimental", rolloutPercent: 0 });
  featureFlagRegistry.register({ id: "experiment-ai-video-studio", label: "AI Video Studio", description: "AI-generated short-form video creation.", defaultEnabled: false, category: "experimental", rolloutPercent: 0 });
  featureFlagRegistry.register({ id: "experiment-advanced-analytics", label: "Advanced Analytics", description: "Deeper cross-module analytics correlations.", defaultEnabled: false, category: "experimental", rolloutPercent: 0 });
}

/** Connector and Execution usage — recorded straight from the real events Phases 5/7 already publish, not polled. */
function registerEventDrivenUsage(): void {
  platformEventBus.registerHandler("commercial-connector-usage", async (event: BackgroundEvent) => {
    if (event.type !== "ConnectorSyncCompleted" && event.type !== "ConnectorSyncFailed") return;
    if (!event.organizationId) return;
    usageMeteringEngine.record({ usageTypeId: "connector_syncs", organizationId: event.organizationId, quantity: 1 });
    const recordsProcessed = event.data.recordsProcessed as number | undefined;
    if (recordsProcessed) usageMeteringEngine.record({ usageTypeId: "connector_api_calls", organizationId: event.organizationId, quantity: recordsProcessed });
  });
  void platformEventBus.subscribe("ConnectorSyncCompleted", "commercial-connector-usage", "Commercial usage metering: connector syncs");
  void platformEventBus.subscribe("ConnectorSyncFailed", "commercial-connector-usage", "Commercial usage metering: connector syncs");

  platformEventBus.registerHandler("commercial-execution-usage", async (event: BackgroundEvent) => {
    if (event.type !== "ExecutionCompleted" && event.type !== "ExecutionFailed") return;
    if (!event.organizationId) return;
    usageMeteringEngine.record({ usageTypeId: "executions", organizationId: event.organizationId, quantity: 1 });
  });
  void platformEventBus.subscribe("ExecutionCompleted", "commercial-execution-usage", "Commercial usage metering: executions");
  void platformEventBus.subscribe("ExecutionFailed", "commercial-execution-usage", "Commercial usage metering: executions");
}

/** AI and API usage — read as NEW records only since the last sweep, then recorded once each; a real recurring job via Phase 7's Execution Platform, not a new poller. Also sweeps grace-period expiry and lapsed credits. */
function registerCommercialTick(): void {
  const handler: WorkerHandler = async () => {
    const now = new Date().toISOString();
    const organizations = organizationRegistry.list();

    const newAiRecords = (await aiAnalytics.getRecords({ limit: 10_000 })).data.filter(r => r.timestamp > lastAiSync);
    for (const record of newAiRecords) {
      if (!record.organizationId) continue;
      usageMeteringEngine.record({ usageTypeId: "ai_requests", organizationId: record.organizationId, workspaceId: record.workspaceId, quantity: 1 });
      usageMeteringEngine.record({ usageTypeId: "ai_tokens", organizationId: record.organizationId, workspaceId: record.workspaceId, quantity: record.totalTokens });
    }
    lastAiSync = now;

    const newApiRecords = apiAnalyticsEngine.getRecordsSince(lastApiSync);
    for (const record of newApiRecords) {
      if (!record.organizationId) continue;
      usageMeteringEngine.record({ usageTypeId: "api_calls", organizationId: record.organizationId, workspaceId: record.workspaceId, quantity: 1 });
    }
    lastApiSync = now;

    for (const organization of organizations) {
      subscriptionEngine.expireIfGraceElapsed(organization.id);
    }
    const expiredCredits = creditEngine.expireLapsed();

    return { success: true, data: { aiRecords: newAiRecords.length, apiRecords: newApiRecords.length, organizationsSwept: organizations.length, expiredCredits } };
  };

  workerPlatformAPI.register(
    { name: "commercial-tick", description: "Records new AI/API usage, sweeps subscription grace periods, and expires lapsed credits.", module: "commercial", version: "1.0.0", concurrency: 1, maxRetries: 1, timeout: 60_000, handles: ["scheduled"], isActive: true },
    handler
  );

  void schedulerPlatformAPI.createSchedule({
    name: "commercial-tick",
    frequency: "custom",
    worker: "commercial-tick",
    payload: {},
    isActive: true,
  });
}
