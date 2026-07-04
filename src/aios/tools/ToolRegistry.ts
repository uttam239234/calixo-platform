/**
 * Calixo Platform - Tool Registry
 *
 * Modules expose tools through this registry.
 * AI invokes tools through interfaces with no direct module coupling.
 */

import { appLogger } from '@/logging';
import type { Tool, ToolDefinition, ToolResult } from '@/aios/types';

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  register(tool: Tool, handler: ToolHandler): void {
    if (this.tools.has(tool.name)) {
      appLogger.warn('ToolRegistry', `Tool ${tool.name} already registered`);
      return;
    }
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
    appLogger.info('ToolRegistry', `Tool registered: ${tool.name} (${tool.module})`);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name)?.definition;
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolsByModule(module: string): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.module === module);
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  async execute(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const handler = this.handlers.get(name);
    if (!handler) {
      return { success: false, error: `Tool not found: ${name}` };
    }
    try {
      return await handler(args);
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  unregister(name: string): void {
    this.tools.delete(name);
    this.handlers.delete(name);
  }
}

export const toolRegistry = new ToolRegistry();