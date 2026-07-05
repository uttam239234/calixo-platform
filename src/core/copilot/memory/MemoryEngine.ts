/**
 * Calixo Platform - Copilot Memory Engine
 *
 * Session-scoped workspace context for the AI Copilot: brand, campaign,
 * audience, platform, tone, region, current module, and recent activity.
 *
 * This intentionally holds no storage of its own — it is a typed,
 * ergonomic wrapper around the enterprise AIOS Memory Engine (conversation
 * scope), so Copilot context lives in the same memory substrate as the
 * rest of the AI platform instead of a second, duplicate store.
 */

import { memoryEngine as aiosMemoryEngine, MemoryEngine as AiosMemoryEngine } from "@/aios/memory/MemoryEngine";
import type { RecentListField, WorkspaceContext } from "../types/index";

const CONTEXT_KEY = "copilot.workspace_context";
const MAX_RECENT_ITEMS = 10;

function emptyContext(): WorkspaceContext {
  return { recentAssets: [], recentReports: [], recentWorkflows: [], pinnedResources: [], recentChats: [] };
}

export class CopilotMemoryEngine {
  constructor(private base: AiosMemoryEngine = aiosMemoryEngine) {}

  async getContext(sessionId: string): Promise<WorkspaceContext> {
    const entry = await this.base.recall("conversation", sessionId, CONTEXT_KEY);
    if (!entry) return emptyContext();
    try {
      return { ...emptyContext(), ...(JSON.parse(entry.value) as Partial<WorkspaceContext>) };
    } catch {
      return emptyContext();
    }
  }

  async updateContext(sessionId: string, patch: Partial<WorkspaceContext>): Promise<WorkspaceContext> {
    const current = await this.getContext(sessionId);
    const next: WorkspaceContext = { ...current, ...patch };
    await this.replace(sessionId, next);
    return next;
  }

  async pushRecent(sessionId: string, field: RecentListField, value: string): Promise<WorkspaceContext> {
    const current = await this.getContext(sessionId);
    const list = [value, ...current[field].filter(v => v !== value)].slice(0, MAX_RECENT_ITEMS);
    const patch: Partial<WorkspaceContext> = { [field]: list };
    return this.updateContext(sessionId, patch);
  }

  async pinResource(sessionId: string, resourceId: string): Promise<WorkspaceContext> {
    const current = await this.getContext(sessionId);
    if (current.pinnedResources.includes(resourceId)) return current;
    return this.updateContext(sessionId, { pinnedResources: [...current.pinnedResources, resourceId] });
  }

  async unpinResource(sessionId: string, resourceId: string): Promise<WorkspaceContext> {
    const current = await this.getContext(sessionId);
    return this.updateContext(sessionId, { pinnedResources: current.pinnedResources.filter(r => r !== resourceId) });
  }

  async clear(sessionId: string): Promise<boolean> {
    const entry = await this.base.recall("conversation", sessionId, CONTEXT_KEY);
    if (!entry) return false;
    return this.base.delete(entry.id);
  }

  private async replace(sessionId: string, next: WorkspaceContext): Promise<void> {
    const existing = await this.base.recall("conversation", sessionId, CONTEXT_KEY);
    if (existing) await this.base.delete(existing.id);
    await this.base.store({
      scope: "conversation",
      scopeId: sessionId,
      key: CONTEXT_KEY,
      value: JSON.stringify(next),
      type: "context",
      importance: 5,
    });
  }
}

export const copilotMemoryEngine = new CopilotMemoryEngine();
