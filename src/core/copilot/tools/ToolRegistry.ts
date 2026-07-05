/**
 * Calixo Platform - Copilot Tool Registry
 *
 * Generic, provider-agnostic tool registry for the AI Copilot. Tools wrap
 * existing platform engines today, and can wrap AIOS tools or external
 * providers in the future — the Planner and Execution engines discover
 * and invoke tools through this interface with no hardcoded tool list.
 */

import { appLogger } from "@/logging";
import type { PlatformTool, ToolCapability, ToolExecutionResult, ToolHandler, ToolProviderKind } from "../types/index";

export class ToolRegistry {
  private tools: Map<string, PlatformTool> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  register(tool: PlatformTool, handler?: ToolHandler): void {
    if (this.tools.has(tool.id)) {
      appLogger.warn("Copilot.ToolRegistry", `Tool ${tool.id} already registered`);
      return;
    }
    this.tools.set(tool.id, tool);
    if (handler) this.handlers.set(tool.id, handler);
    appLogger.info("Copilot.ToolRegistry", `Tool registered: ${tool.id} (${tool.provider}:${tool.providerRef})`);
  }

  unregister(id: string): void {
    this.tools.delete(id);
    this.handlers.delete(id);
  }

  lookup(id: string): PlatformTool | undefined {
    return this.tools.get(id);
  }

  list(): PlatformTool[] {
    return Array.from(this.tools.values());
  }

  listByProvider(provider: ToolProviderKind): PlatformTool[] {
    return this.list().filter(t => t.provider === provider);
  }

  discover(query: string): PlatformTool[] {
    const q = query.toLowerCase();
    return this.list().filter(
      t =>
        t.isActive &&
        (t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    );
  }

  metadata(id: string): Record<string, unknown> | undefined {
    return this.tools.get(id)?.metadata;
  }

  capabilities(id: string): ToolCapability[] {
    return this.tools.get(id)?.capabilities ?? [];
  }

  async execute(id: string, input: Record<string, unknown> = {}): Promise<ToolExecutionResult> {
    const start = Date.now();
    const tool = this.tools.get(id);
    if (!tool) return { success: false, error: `Tool not found: ${id}`, durationMs: Date.now() - start };

    const handler = this.handlers.get(id);
    if (!handler) return { success: false, error: `No handler registered for tool: ${id}`, durationMs: Date.now() - start };

    try {
      const result = await handler(input);
      return { ...result, durationMs: Date.now() - start };
    } catch (error) {
      return { success: false, error: (error as Error).message, durationMs: Date.now() - start };
    }
  }
}

export const toolRegistry = new ToolRegistry();
