/**
 * Calixo Platform - AI Copilot Commercial Adapter
 *
 * Same thin-adapter convention as `ContentUsageAdapter.ts`: no billing
 * logic here, only entitlement reads and usage writes against the real
 * Commercial Platform. Tracks exactly the brief's named usage list: AI
 * requests, tokens, actions, generations, exports, reports.
 */
import { entitlementPlatformAPI } from "@/core/platform/commercial/EntitlementPlatformAPI";
import { usagePlatformAPI } from "@/core/platform/commercial/UsagePlatformAPI";
import type { UsagePeriod, UsageTypeDefinition } from "@/core/platform/commercial/types";

export const COPILOT_USAGE_TYPES: UsageTypeDefinition[] = [
  { id: "copilot.aiRequest", name: "AI Request", description: "A message sent to AI Copilot", unit: "action", category: "core", owner: "ai-copilot" },
  { id: "copilot.tokensEstimated", name: "Tokens (Estimated)", description: "Estimated token volume processed — a length-based estimate, not a real LLM token count", unit: "credit", category: "core", owner: "ai-copilot" },
  { id: "copilot.actionExecuted", name: "Action Executed", description: "A tool call Copilot ran on the user's behalf", unit: "action", category: "core", owner: "ai-copilot" },
  { id: "copilot.generation", name: "Generation", description: "Copilot produced a content/creative generation", unit: "action", category: "core", owner: "ai-copilot" },
  { id: "copilot.export", name: "Export", description: "Copilot produced or requested an export", unit: "export", category: "core", owner: "ai-copilot" },
  { id: "copilot.report", name: "Report", description: "Copilot generated or referenced a report", unit: "action", category: "core", owner: "ai-copilot" },
];

let registered = false;

/** Safe to call more than once — registers Copilot's usage types exactly once. */
export function registerCopilotUsageTypes(): void {
  if (registered) return;
  registered = true;
  for (const type of COPILOT_USAGE_TYPES) usagePlatformAPI.registerType(type);
}

export interface CopilotUsageTenantContext {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
}

/** Reads the real Entitlement Platform — returns `false` only if an admin has actually configured a quota/limit for this key and it's been reached. */
export function canUseCopilotFeature(context: CopilotUsageTenantContext, key: string): boolean {
  return entitlementPlatformAPI.canUse({ organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, key }).allowed;
}

/** Writes one real Usage Platform record. Defensively re-registers Copilot's usage types first (cheap, idempotent). */
export function recordCopilotUsage(context: CopilotUsageTenantContext, usageTypeId: string, quantity = 1): void {
  registerCopilotUsageTypes();
  usagePlatformAPI.record({ usageTypeId, organizationId: context.organizationId, workspaceId: context.workspaceId, userId: context.userId, quantity });
}

/** Reads a real usage total for this period. */
export function getCopilotUsageTotal(context: CopilotUsageTenantContext, usageTypeId: string, period: UsagePeriod = "monthly"): number {
  registerCopilotUsageTypes();
  return usagePlatformAPI.getTotal(usageTypeId, context.organizationId, period, context.workspaceId, context.userId);
}

/** A length-based estimate, disclosed as such — no real tokenizer runs anywhere in this codebase. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4));
}
