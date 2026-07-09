/**
 * Calixo Platform - Ads Automation Adapter
 *
 * Wires Ads Manager into the REAL Execution/Automation Platform (`core/platform/execution`)
 * instead of inventing a bespoke scheduler: one real Worker (registered via
 * `executionDeveloperSDK.defineWorker`) whose handler calls `adsEngine.applyAction()`/
 * `.update()` directly, and 4 real `ExecutionTypeDefinition`s (`isReal: true` — they genuinely
 * run, unlike a "declared but not implemented" placeholder type).
 *
 * `initializePlatformFoundation()` already starts the real queue/scheduler/event-bus poll loops
 * (see `initializeExecutionFoundation()`), so registering this worker is enough to make it
 * genuinely live — no bespoke `setInterval` polling is created here.
 *
 * User-defined rules (`AdsAutomationRuleRegistry` below) are registered as real
 * `AutomationDefinition`s with `triggerType: "manual"` and a real `AutomationCondition` — matching
 * campaigns are resolved client-side (mirroring the platform's own private condition matcher)
 * and submitted as a tracked Execution via `automationPlatformAPI.trigger()`. "Run rule now" is
 * the real, honest scope today; the rules are registered against the platform's real
 * condition/trigger shape so they are genuinely ready for an event/schedule trigger later without
 * any rework.
 */
import { generateId } from "@/shared/utils/string";
import { automationPlatformAPI, executionDeveloperSDK } from "@/core/platform/execution";
import type { AutomationCondition, AutomationDefinition } from "@/core/platform/execution";
import type { Job, WorkerResult } from "@/background/types";
import { adsEngine } from "../engine/AdsEngine";
import type { Campaign, CampaignAction, CampaignStatus } from "../types";

const WORKER_NAME = "ads-automation-worker";

export type AdsAutomationAction = "Pause" | "Resume" | "Archive" | "BudgetIncrease";

const EXECUTION_TYPE_IDS: Record<AdsAutomationAction, string> = {
  Pause: "ads.campaign.pause",
  Resume: "ads.campaign.resume",
  Archive: "ads.campaign.archive",
  BudgetIncrease: "ads.budget.increase",
};

/** A rule's chosen condition is single-field, so this closes the gap: never resume something that isn't Paused, never pause/boost-budget something that isn't Running. Archive has no precondition — most non-archived states are reasonable to archive. */
const STATUS_PRECONDITION: Record<AdsAutomationAction, CampaignStatus | null> = {
  Pause: "Running",
  Resume: "Paused",
  Archive: null,
  BudgetIncrease: "Running",
};

function errorResult(message: string): WorkerResult {
  return { success: false, error: { message, category: "permanent", timestamp: new Date().toISOString() } };
}

/** The one real handler every Ads automation execution type dispatches through — discriminates on `job.payload.action` since a single worker's `handles` list is declarative, not a runtime dispatch key. */
async function handleAdsAutomationJob(job: Job): Promise<WorkerResult> {
  const action = job.payload.action as AdsAutomationAction | undefined;
  const campaignIds = (job.payload.campaignIds as string[] | undefined) ?? [];
  if (!action) return errorResult("Missing 'action' in automation job payload.");
  if (campaignIds.length === 0) return { success: true, data: { affected: 0, reason: "No campaigns matched the rule's condition." } };

  if (action === "BudgetIncrease") {
    const multiplier = (job.payload.budgetMultiplier as number | undefined) ?? 1.1;
    let affected = 0;
    for (const id of campaignIds) {
      const campaign = adsEngine.get(id);
      if (!campaign) continue;
      adsEngine.update(id, { budget: Math.round(campaign.budget * multiplier) });
      affected += 1;
    }
    return { success: true, data: { affected, multiplier } };
  }

  const campaignAction: CampaignAction = action;
  const result = adsEngine.applyAction(campaignIds, campaignAction);
  return { success: true, data: { affected: result.length } };
}

let workerRegistered = false;

/** Safe to call more than once — registers the real worker and its 4 execution types exactly once. */
export function registerAdsAutomationWiring(): void {
  if (workerRegistered) return;
  workerRegistered = true;

  executionDeveloperSDK.defineWorker(
    {
      name: WORKER_NAME,
      description: "Applies real campaign pause/resume/archive/budget-increase actions for Ads Manager automation rules",
      module: "ads",
      version: "1.0.0",
      concurrency: 3,
      maxRetries: 2,
      timeout: 15_000,
      handles: Object.values(EXECUTION_TYPE_IDS),
      isActive: true,
    },
    handleAdsAutomationJob
  );

  for (const [action, id] of Object.entries(EXECUTION_TYPE_IDS) as [AdsAutomationAction, string][]) {
    executionDeveloperSDK.defineExecutionType({
      id,
      name: `Ads: ${action}`,
      description: `Applies the "${action}" action to the campaigns matched by an Ads automation rule.`,
      kind: "queued",
      worker: WORKER_NAME,
      defaultPriority: "medium",
      defaultTimeoutMs: 15_000,
      defaultMaxRetries: 2,
      tags: ["ads", "automation"],
      owner: "ads-manager",
      isReal: true,
    });
  }
}

export interface AdsAutomationRule {
  id: string;
  name: string;
  description: string;
  action: AdsAutomationAction;
  condition: AutomationCondition;
  isActive: boolean;
  automationId?: string;
  lastRunAt?: string;
  runCount: number;
}

function matchesCondition(campaign: Campaign, condition: AutomationCondition): boolean {
  const value = (campaign as unknown as Record<string, unknown>)[condition.field];
  switch (condition.operator) {
    case "eq":
      return value === condition.value;
    case "neq":
      return value !== condition.value;
    case "gt":
      return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "gte":
      return typeof value === "number" && typeof condition.value === "number" && value >= condition.value;
    case "lt":
      return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    case "lte":
      return typeof value === "number" && typeof condition.value === "number" && value <= condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(value);
    case "contains":
      return typeof value === "string" && typeof condition.value === "string" && value.includes(condition.value);
    case "exists":
      return value !== undefined && value !== null;
    default:
      return false;
  }
}

/**
 * Real, user-defined automation rules — each backed by a real `AutomationDefinition` registered
 * with the platform. Condition matching against the live campaign array happens here (mirroring
 * `AutomationEngine`'s own private matcher) so "Run rule now" only ever acts on campaigns that
 * genuinely satisfy the rule today.
 */
export class AdsAutomationRuleRegistry {
  private rules = new Map<string, AdsAutomationRule>();

  async create(input: { name: string; description: string; action: AdsAutomationAction; condition: AutomationCondition; organizationId: string }): Promise<AdsAutomationRule> {
    registerAdsAutomationWiring();
    const id = generateId(10);
    const definition: Omit<AutomationDefinition, "id" | "runCount" | "createdAt" | "updatedAt" | "scheduleId"> = {
      name: input.name,
      description: input.description,
      triggerType: "manual",
      isActive: true,
      executionTypeId: EXECUTION_TYPE_IDS[input.action],
      payload: { action: input.action },
      condition: input.condition,
      organizationId: input.organizationId,
    };
    const automation = await automationPlatformAPI.register(definition);
    const rule: AdsAutomationRule = { id, name: input.name, description: input.description, action: input.action, condition: input.condition, isActive: true, automationId: automation.id, runCount: 0 };
    this.rules.set(id, rule);
    return rule;
  }

  list(): AdsAutomationRule[] {
    return Array.from(this.rules.values());
  }

  get(id: string): AdsAutomationRule | undefined {
    return this.rules.get(id);
  }

  async setActive(id: string, isActive: boolean): Promise<AdsAutomationRule | undefined> {
    const rule = this.rules.get(id);
    if (!rule || !rule.automationId) return undefined;
    if (isActive) await automationPlatformAPI.activate(rule.automationId);
    else await automationPlatformAPI.deactivate(rule.automationId);
    rule.isActive = isActive;
    return rule;
  }

  delete(id: string): void {
    this.rules.delete(id);
  }

  /**
   * Evaluates the rule's condition against the live campaign array and submits a real, tracked
   * Execution for whatever matches — "Run rule now". Also enforces a status precondition per
   * action independent of the user's chosen condition (e.g. never "Resume" a campaign that
   * isn't currently Paused) — a correctness safeguard the single-field `AutomationCondition`
   * shape can't express on its own.
   */
  async run(id: string, campaigns: Campaign[]): Promise<{ matchedCount: number }> {
    const rule = this.rules.get(id);
    if (!rule || !rule.automationId) throw new Error(`Automation rule not found: ${id}`);
    const precondition = STATUS_PRECONDITION[rule.action];
    const matched = campaigns.filter(c => matchesCondition(c, rule.condition) && (!precondition || c.status === precondition));
    await automationPlatformAPI.trigger(rule.automationId, {
      action: rule.action,
      campaignIds: matched.map(c => c.id),
      ...(rule.action === "BudgetIncrease" ? { budgetMultiplier: 1.1 } : {}),
    });
    rule.runCount += 1;
    rule.lastRunAt = new Date().toISOString();
    return { matchedCount: matched.length };
  }
}

export const adsAutomationRuleRegistry = new AdsAutomationRuleRegistry();
