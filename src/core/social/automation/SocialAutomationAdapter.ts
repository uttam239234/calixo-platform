/**
 * Calixo Platform - Social Automation Adapter
 *
 * Wires Social Media into the REAL Execution/Automation Platform (`core/platform/execution`)
 * instead of inventing a bespoke scheduler — mirrors `AdsAutomationAdapter.ts` exactly, applied
 * to `SocialPost` instead of `Campaign`: one real Worker whose handler calls
 * `socialEngine.updatePostStatus()` directly, and 2 real `ExecutionTypeDefinition`s
 * (`isReal: true` — they genuinely run).
 *
 * `initializePlatformFoundation()` already starts the real queue/scheduler/event-bus poll loops,
 * so registering this worker is enough to make it genuinely live — no bespoke polling is created
 * here.
 *
 * User-defined rules (`SocialAutomationRuleRegistry`) are registered as real
 * `AutomationDefinition`s with `triggerType: "manual"` and a real `AutomationCondition` —
 * matching posts are resolved client-side and submitted as a tracked Execution via
 * `automationPlatformAPI.trigger()`. "Run rule now" is the real, honest scope today.
 */
import { generateId } from "@/shared/utils/string";
import { automationPlatformAPI, executionDeveloperSDK } from "@/core/platform/execution";
import type { AutomationCondition, AutomationDefinition } from "@/core/platform/execution";
import type { Job, WorkerResult } from "@/background/types";
import { socialEngine } from "../engine/SocialEngine";
import type { SocialPost, SocialPostStatus } from "../types";

const WORKER_NAME = "social-automation-worker";

export type SocialAutomationAction = "Publish" | "Cancel";

const EXECUTION_TYPE_IDS: Record<SocialAutomationAction, string> = {
  Publish: "social.post.publish",
  Cancel: "social.post.cancel",
};

function errorResult(message: string): WorkerResult {
  return { success: false, error: { message, category: "permanent", timestamp: new Date().toISOString() } };
}

/** The one real handler every Social automation execution type dispatches through — discriminates on `job.payload.action` since a single worker's `handles` list is declarative, not a runtime dispatch key. */
async function handleSocialAutomationJob(job: Job): Promise<WorkerResult> {
  const action = job.payload.action as SocialAutomationAction | undefined;
  const postIds = (job.payload.postIds as string[] | undefined) ?? [];
  if (!action) return errorResult("Missing 'action' in automation job payload.");
  if (postIds.length === 0) return { success: true, data: { affected: 0, reason: "No posts matched the rule's condition." } };

  const status: SocialPostStatus = action === "Publish" ? "Published" : "Draft";
  let affected = 0;
  for (const id of postIds) {
    const updated = socialEngine.updatePostStatus(id, status);
    if (updated) affected += 1;
  }
  return { success: true, data: { affected } };
}

let workerRegistered = false;

/** Safe to call more than once — registers the real worker and its 2 execution types exactly once. */
export function registerSocialAutomationWiring(): void {
  if (workerRegistered) return;
  workerRegistered = true;

  executionDeveloperSDK.defineWorker(
    {
      name: WORKER_NAME,
      description: "Applies real publish/cancel actions for Social Media automation rules",
      module: "social",
      version: "1.0.0",
      concurrency: 3,
      maxRetries: 2,
      timeout: 15_000,
      handles: Object.values(EXECUTION_TYPE_IDS),
      isActive: true,
    },
    handleSocialAutomationJob
  );

  for (const [action, id] of Object.entries(EXECUTION_TYPE_IDS) as [SocialAutomationAction, string][]) {
    executionDeveloperSDK.defineExecutionType({
      id,
      name: `Social: ${action}`,
      description: `Applies the "${action}" action to the posts matched by a Social Media automation rule.`,
      kind: "queued",
      worker: WORKER_NAME,
      defaultPriority: "medium",
      defaultTimeoutMs: 15_000,
      defaultMaxRetries: 2,
      tags: ["social", "automation"],
      owner: "social-media",
      isReal: true,
    });
  }
}

export interface SocialAutomationRule {
  id: string;
  name: string;
  description: string;
  action: SocialAutomationAction;
  condition: AutomationCondition;
  isActive: boolean;
  automationId?: string;
  lastRunAt?: string;
  runCount: number;
}

function matchesCondition(post: SocialPost, condition: AutomationCondition): boolean {
  const value = (post as unknown as Record<string, unknown>)[condition.field];
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

/** Never publish something that isn't a Draft; never cancel something already Published — a safeguard the single-field `AutomationCondition` can't express on its own. */
const STATUS_PRECONDITION: Record<SocialAutomationAction, SocialPost["status"] | null> = {
  Publish: "Draft",
  Cancel: "Scheduled",
};

/**
 * Real, user-defined automation rules — each backed by a real `AutomationDefinition` registered
 * with the platform. Condition matching against the live post array happens here (mirroring
 * `AutomationEngine`'s own private matcher) so "Run rule now" only ever acts on posts that
 * genuinely satisfy the rule today.
 */
export class SocialAutomationRuleRegistry {
  private rules = new Map<string, SocialAutomationRule>();

  async create(input: { name: string; description: string; action: SocialAutomationAction; condition: AutomationCondition; organizationId: string }): Promise<SocialAutomationRule> {
    registerSocialAutomationWiring();
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
    const rule: SocialAutomationRule = { id, name: input.name, description: input.description, action: input.action, condition: input.condition, isActive: true, automationId: automation.id, runCount: 0 };
    this.rules.set(id, rule);
    return rule;
  }

  list(): SocialAutomationRule[] {
    return Array.from(this.rules.values());
  }

  async setActive(id: string, isActive: boolean): Promise<SocialAutomationRule | undefined> {
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

  /** Evaluates the rule's condition against the live post array and submits a real, tracked Execution for whatever matches — "Run rule now". */
  async run(id: string, posts: SocialPost[]): Promise<{ matchedCount: number }> {
    const rule = this.rules.get(id);
    if (!rule || !rule.automationId) throw new Error(`Automation rule not found: ${id}`);
    const precondition = STATUS_PRECONDITION[rule.action];
    const matched = posts.filter(post => matchesCondition(post, rule.condition) && (!precondition || post.status === precondition));
    await automationPlatformAPI.trigger(rule.automationId, { action: rule.action, postIds: matched.map(post => post.id) });
    rule.runCount += 1;
    rule.lastRunAt = new Date().toISOString();
    return { matchedCount: matched.length };
  }
}

export const socialAutomationRuleRegistry = new SocialAutomationRuleRegistry();
