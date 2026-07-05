/**
 * Calixo Platform - Copilot Tool Types
 *
 * Generic, provider-agnostic tool metadata. "provider" identifies where a
 * tool's capability comes from (an existing engine today, the AIOS tool
 * registry, or an external provider in the future) without the registry
 * itself knowing anything module-specific.
 */

export type ToolProviderKind = "engine" | "aios" | "external";

export interface ToolCapability {
  name: string;
  description?: string;
}

export interface PlatformTool {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: ToolProviderKind;
  providerRef: string;
  capabilities: ToolCapability[];
  inputSchema?: Record<string, unknown>;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

export type ToolHandler = (input: Record<string, unknown>) => Promise<ToolExecutionResult>;
