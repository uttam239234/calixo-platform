/**
 * Calixo Platform - Automation Platform API
 */
import { automationEngine } from "./AutomationEngine";
import type { AutomationDefinition, AutomationTriggerType } from "./types";

export class AutomationPlatformAPI {
  register(definition: Omit<AutomationDefinition, "id" | "runCount" | "createdAt" | "updatedAt" | "scheduleId">): Promise<AutomationDefinition> {
    return automationEngine.register(definition);
  }

  trigger(automationId: string, input: Record<string, unknown> = {}): Promise<void> {
    return automationEngine.trigger(automationId, input);
  }

  activate(automationId: string): Promise<AutomationDefinition | undefined> {
    return automationEngine.activate(automationId);
  }

  deactivate(automationId: string): Promise<AutomationDefinition | undefined> {
    return automationEngine.deactivate(automationId);
  }

  get(automationId: string): AutomationDefinition | undefined {
    return automationEngine.get(automationId);
  }

  list(params: { organizationId?: string; triggerType?: AutomationTriggerType; isActive?: boolean } = {}): AutomationDefinition[] {
    return automationEngine.list(params);
  }

  count(): number {
    return automationEngine.count();
  }
}

export const automationPlatformAPI = new AutomationPlatformAPI();
