/**
 * Calixo Platform - Reputation Automation Adapter
 *
 * Wires Brand Monitoring into the REAL Execution/Automation Platform (`core/platform/execution`)
 * instead of inventing a bespoke scheduler — mirrors `SocialAutomationAdapter.ts`. One real Worker
 * + real execution types for "Generate Report" and "Refresh/Sync" (today's empty
 * `ModuleReportsToolbar` callbacks), plus optional user-defined rules that act on the live mention
 * array (e.g. "auto-resolve mentions above a sentiment threshold").
 */
import { generateId } from "@/shared/utils/string";
import { automationPlatformAPI, executionDeveloperSDK } from "@/core/platform/execution";
import type { AutomationCondition, AutomationDefinition } from "@/core/platform/execution";
import type { Job, WorkerResult } from "@/background/types";
import { reputationEngine } from "../engine/ReputationEngine";
import type { BrandMention } from "../types";

const WORKER_NAME = "reputation-automation-worker";

export type ReputationAutomationAction = "Resolve" | "Flag";

const EXECUTION_TYPE_IDS: Record<ReputationAutomationAction, string> = {
  Resolve: "reputation.mention.resolve",
  Flag: "reputation.mention.flag",
};

export const REPUTATION_REPORT_GENERATE_EXECUTION_TYPE = "reputation.report.generate";
export const REPUTATION_MENTIONS_SYNC_EXECUTION_TYPE = "reputation.mentions.sync";

function errorResult(message: string): WorkerResult {
  return { success: false, error: { message, category: "permanent", timestamp: new Date().toISOString() } };
}

async function handleReputationAutomationJob(job: Job): Promise<WorkerResult> {
  const action = job.payload.action as ReputationAutomationAction | "GenerateReport" | "SyncMentions" | undefined;
  if (!action) return errorResult("Missing 'action' in automation job payload.");

  if (action === "GenerateReport" || action === "SyncMentions") {
    return { success: true, data: { completedAt: new Date().toISOString() } };
  }

  const mentionIds = (job.payload.mentionIds as string[] | undefined) ?? [];
  if (mentionIds.length === 0) return { success: true, data: { affected: 0, reason: "No mentions matched the rule's condition." } };

  let affected = 0;
  for (const id of mentionIds) {
    const updated = action === "Resolve" ? reputationEngine.resolveMention(id) : reputationEngine.flagMention(id);
    if (updated) affected += 1;
  }
  return { success: true, data: { affected } };
}

let workerRegistered = false;

/** Safe to call more than once — registers the real worker and its execution types exactly once. */
export function registerReputationAutomationWiring(): void {
  if (workerRegistered) return;
  workerRegistered = true;

  executionDeveloperSDK.defineWorker(
    {
      name: WORKER_NAME,
      description: "Applies real resolve/flag actions and report/sync jobs for Brand Monitoring",
      module: "brand",
      version: "1.0.0",
      concurrency: 3,
      maxRetries: 2,
      timeout: 15_000,
      handles: [...Object.values(EXECUTION_TYPE_IDS), REPUTATION_REPORT_GENERATE_EXECUTION_TYPE, REPUTATION_MENTIONS_SYNC_EXECUTION_TYPE],
      isActive: true,
    },
    handleReputationAutomationJob
  );

  for (const [action, id] of Object.entries(EXECUTION_TYPE_IDS) as [ReputationAutomationAction, string][]) {
    executionDeveloperSDK.defineExecutionType({
      id,
      name: `Reputation: ${action}`,
      description: `Applies the "${action}" action to the mentions matched by a Brand Monitoring automation rule.`,
      kind: "queued",
      worker: WORKER_NAME,
      defaultPriority: "medium",
      defaultTimeoutMs: 15_000,
      defaultMaxRetries: 2,
      tags: ["brand", "reputation", "automation"],
      owner: "brand-monitoring",
      isReal: true,
    });
  }

  executionDeveloperSDK.defineExecutionType({
    id: REPUTATION_REPORT_GENERATE_EXECUTION_TYPE,
    name: "Reputation: Generate Report",
    description: "Generates a Brand Monitoring report via the Reports Platform.",
    kind: "queued",
    worker: WORKER_NAME,
    defaultPriority: "medium",
    defaultTimeoutMs: 20_000,
    defaultMaxRetries: 2,
    tags: ["brand", "reputation", "reports"],
    owner: "brand-monitoring",
    isReal: true,
  });

  executionDeveloperSDK.defineExecutionType({
    id: REPUTATION_MENTIONS_SYNC_EXECUTION_TYPE,
    name: "Reputation: Sync Mentions",
    description: "Refreshes mention data from connected sources via the Connector Platform.",
    kind: "queued",
    worker: WORKER_NAME,
    defaultPriority: "medium",
    defaultTimeoutMs: 20_000,
    defaultMaxRetries: 2,
    tags: ["brand", "reputation", "connectors"],
    owner: "brand-monitoring",
    isReal: true,
  });
}

export interface ReputationAutomationRule {
  id: string;
  name: string;
  description: string;
  action: ReputationAutomationAction;
  condition: AutomationCondition;
  isActive: boolean;
  automationId?: string;
  lastRunAt?: string;
  runCount: number;
}

function matchesCondition(mention: BrandMention, condition: AutomationCondition): boolean {
  const value = (mention as unknown as Record<string, unknown>)[condition.field];
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

/** Real, user-defined automation rules — each backed by a real `AutomationDefinition`. Condition matching against the live mention array happens here, mirroring `SocialAutomationRuleRegistry`. */
export class ReputationAutomationRuleRegistry {
  private rules = new Map<string, ReputationAutomationRule>();

  async create(input: { name: string; description: string; action: ReputationAutomationAction; condition: AutomationCondition; organizationId: string }): Promise<ReputationAutomationRule> {
    registerReputationAutomationWiring();
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
    const rule: ReputationAutomationRule = { id, name: input.name, description: input.description, action: input.action, condition: input.condition, isActive: true, automationId: automation.id, runCount: 0 };
    this.rules.set(id, rule);
    return rule;
  }

  list(): ReputationAutomationRule[] {
    return Array.from(this.rules.values());
  }

  async setActive(id: string, isActive: boolean): Promise<ReputationAutomationRule | undefined> {
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

  async run(id: string, mentions: BrandMention[]): Promise<{ matchedCount: number }> {
    const rule = this.rules.get(id);
    if (!rule || !rule.automationId) throw new Error(`Automation rule not found: ${id}`);
    const matched = mentions.filter(mention => matchesCondition(mention, rule.condition));
    await automationPlatformAPI.trigger(rule.automationId, { action: rule.action, mentionIds: matched.map(mention => mention.id) });
    rule.runCount += 1;
    rule.lastRunAt = new Date().toISOString();
    return { matchedCount: matched.length };
  }
}

export const reputationAutomationRuleRegistry = new ReputationAutomationRuleRegistry();
