/**
 * Calixo Platform - Automation Platform
 *
 * `background/workflow/WorkflowEngine.ts` already models `Workflow.trigger`
 * (event/schedule/webhook/manual/condition) — that IS the mandate's
 * "Workflow Platform defines business logic." But nothing ever evaluated a
 * trigger: no schedule was created for a `schedule` trigger, nothing
 * subscribed to events for an `event` trigger. This engine is the fix — it
 * makes triggers real by wiring them to `schedulerEngine`/`eventBus`
 * (reused, not duplicated) and submits the resulting work as a tracked
 * Execution rather than calling business logic inline.
 */
import { generateId } from "@/shared/utils/string";
import { schedulerEngine } from "@/background/scheduler/SchedulerEngine";
import { eventBus } from "@/background/events/EventBus";
import type { Event as BackgroundEvent, ScheduleFrequency } from "@/background/types";
import { workerRegistry } from "@/background/workers/WorkerRegistry";
import { platformEventBus } from "@/core/platform/events/PlatformEventBus";
import { executionEngine } from "./ExecutionEngine";
import { executionRegistry } from "./ExecutionRegistry";
import type { AutomationCondition, AutomationDefinition, AutomationTriggerType } from "./types";

const AUTOMATION_DISPATCH_WORKER = "automation-dispatch";

function matchesCondition(payload: Record<string, unknown>, condition: AutomationCondition): boolean {
  const value = payload[condition.field];
  switch (condition.operator) {
    case "eq": return value === condition.value;
    case "neq": return value !== condition.value;
    case "gt": return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "gte": return typeof value === "number" && typeof condition.value === "number" && value >= condition.value;
    case "lt": return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    case "lte": return typeof value === "number" && typeof condition.value === "number" && value <= condition.value;
    case "in": return Array.isArray(condition.value) && condition.value.includes(value);
    case "contains": return typeof value === "string" && typeof condition.value === "string" && value.includes(condition.value);
    case "exists": return value !== undefined && value !== null;
    default: return false;
  }
}

let dispatchWorkerRegistered = false;

export class AutomationEngine {
  private automations = new Map<string, AutomationDefinition>();

  /** Registers the one worker schedule-triggered automations dispatch through — looks up the automation by id (kept out of the schedule payload's own shape) and submits the real Execution. */
  private ensureDispatchWorker(): void {
    if (dispatchWorkerRegistered) return;
    dispatchWorkerRegistered = true;
    workerRegistry.register(
      {
        name: AUTOMATION_DISPATCH_WORKER,
        description: "Resolves a due Automation and submits its target Execution.",
        module: "execution",
        version: "1.0.0",
        concurrency: 10,
        maxRetries: 1,
        timeout: 30_000,
        handles: ["scheduled", "immediate"],
        isActive: true,
      },
      async job => {
        const automationId = job.payload.automationId as string;
        const automation = this.automations.get(automationId);
        if (!automation || !automation.isActive) {
          return { success: false, error: { message: `Automation not found or inactive: ${automationId}`, category: "permanent", timestamp: new Date().toISOString() } };
        }
        await this.dispatch(automation, {});
        return { success: true, data: { automationId } };
      }
    );
  }

  async register(definition: Omit<AutomationDefinition, "id" | "runCount" | "createdAt" | "updatedAt" | "scheduleId">): Promise<AutomationDefinition> {
    this.ensureDispatchWorker();
    const now = new Date().toISOString();
    const automation: AutomationDefinition = { ...definition, id: generateId(14), runCount: 0, createdAt: now, updatedAt: now };

    if (automation.triggerType === "schedule") {
      const schedule = await schedulerEngine.createSchedule({
        name: `automation:${automation.name}`,
        frequency: (automation.payload.frequency as ScheduleFrequency) ?? "daily",
        hour: automation.payload.hour as number | undefined,
        minute: automation.payload.minute as number | undefined,
        timezone: automation.payload.timezone as string | undefined,
        worker: AUTOMATION_DISPATCH_WORKER,
        payload: { automationId: automation.id },
        organizationId: automation.organizationId,
        workspaceId: automation.workspaceId,
        isActive: automation.isActive,
      });
      automation.scheduleId = schedule.id;
    }

    if ((automation.triggerType === "event" || automation.triggerType === "condition") && automation.eventType) {
      const handlerName = `automation:${automation.id}`;
      eventBus.registerHandler(handlerName, async (event: BackgroundEvent) => {
        if (event.type !== automation.eventType) return;
        if (automation.condition && !matchesCondition(event.data, automation.condition)) return;
        await this.dispatch(automation, event.data);
      });
      await eventBus.subscribe(automation.eventType, handlerName, `Automation: ${automation.name}`);
    }

    this.automations.set(automation.id, automation);
    return { ...automation };
  }

  /** Submits the automation's target work as a tracked Execution — the workflow trigger delegates to `background`'s real WorkflowEngine via the "workflow" worker rather than executing business logic here. */
  private async dispatch(automation: AutomationDefinition, eventPayload: Record<string, unknown>): Promise<void> {
    const executionType = executionRegistry.get(automation.executionTypeId);
    const worker = executionType?.worker ?? "workflow";

    await executionEngine.submit({
      executionTypeId: automation.executionTypeId,
      name: `automation:${automation.name}`,
      worker,
      payload: automation.workflowId ? { workflowId: automation.workflowId, input: { ...automation.payload, ...eventPayload } } : { ...automation.payload, ...eventPayload },
      organizationId: automation.organizationId,
      workspaceId: automation.workspaceId,
      tags: ["automation", `automation:${automation.id}`],
    });

    automation.runCount += 1;
    automation.lastRunAt = new Date().toISOString();
    automation.updatedAt = automation.lastRunAt;
    void platformEventBus.publish({ type: "AutomationTriggered", organizationId: automation.organizationId, workspaceId: automation.workspaceId, payload: { automationId: automation.id, triggerType: automation.triggerType } });
  }

  /** Manual trigger — Level 1 business-user "Run Now" action. */
  async trigger(automationId: string, input: Record<string, unknown> = {}): Promise<void> {
    const automation = this.automations.get(automationId);
    if (!automation) throw new Error(`Automation not found: ${automationId}`);
    await this.dispatch(automation, input);
  }

  async deactivate(automationId: string): Promise<AutomationDefinition | undefined> {
    const automation = this.automations.get(automationId);
    if (!automation) return undefined;
    automation.isActive = false;
    automation.updatedAt = new Date().toISOString();
    if (automation.scheduleId) await schedulerEngine.deactivateSchedule(automation.scheduleId);
    return { ...automation };
  }

  async activate(automationId: string): Promise<AutomationDefinition | undefined> {
    const automation = this.automations.get(automationId);
    if (!automation) return undefined;
    automation.isActive = true;
    automation.updatedAt = new Date().toISOString();
    if (automation.scheduleId) await schedulerEngine.activateSchedule(automation.scheduleId);
    return { ...automation };
  }

  get(automationId: string): AutomationDefinition | undefined {
    const automation = this.automations.get(automationId);
    return automation ? { ...automation } : undefined;
  }

  list(params: { organizationId?: string; triggerType?: AutomationTriggerType; isActive?: boolean } = {}): AutomationDefinition[] {
    return Array.from(this.automations.values())
      .filter(a => !params.organizationId || a.organizationId === params.organizationId)
      .filter(a => !params.triggerType || a.triggerType === params.triggerType)
      .filter(a => params.isActive === undefined || a.isActive === params.isActive)
      .map(a => ({ ...a }));
  }

  count(): number {
    return this.automations.size;
  }
}

export const automationEngine = new AutomationEngine();
