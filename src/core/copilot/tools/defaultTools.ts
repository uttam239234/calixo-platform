/**
 * Calixo Platform - Copilot Default Tools
 *
 * Metadata for the tools backed by engines that exist today. No handlers
 * are wired here — that is deliberate for this foundation phase. Wiring a
 * handler (via `toolRegistry.register(tool, handler)`) is how a future
 * phase connects a tool to real execution without modifying this registry.
 */

import { toolRegistry, ToolRegistry } from "./ToolRegistry";
import type { PlatformTool } from "../types/index";

const DEFAULT_TOOLS: PlatformTool[] = [
  {
    id: "generate-content",
    name: "Generate Content",
    description: "Generate marketing content using AI",
    category: "content",
    provider: "engine",
    providerRef: "GenerationEngine",
    capabilities: [{ name: "text-generation" }],
    isActive: true,
  },
  {
    id: "generate-creative",
    name: "Generate Creative",
    description: "Create a creative document with a layout blueprint",
    category: "creative",
    provider: "engine",
    providerRef: "CreativeEngine",
    capabilities: [{ name: "creative-brief" }],
    isActive: true,
  },
  {
    id: "generate-image",
    name: "Generate Image",
    description: "Generate an AI image from a prompt",
    category: "media",
    provider: "engine",
    providerRef: "MediaGenerationEngine",
    capabilities: [{ name: "image-generation" }],
    isActive: true,
  },
  {
    id: "analyze-content",
    name: "Analyze Content",
    description: "Run AI-powered content intelligence analysis",
    category: "analysis",
    provider: "engine",
    providerRef: "ContentIntelligenceEngine",
    capabilities: [{ name: "content-analysis" }],
    isActive: true,
  },
  {
    id: "search-library",
    name: "Search Library",
    description: "Search the Marketing Resource Hub",
    category: "library",
    provider: "engine",
    providerRef: "LibraryEngine",
    capabilities: [{ name: "asset-search" }],
    isActive: true,
  },
  {
    id: "manage-assets",
    name: "Manage Assets",
    description: "Store and retrieve assets",
    category: "asset",
    provider: "engine",
    providerRef: "AssetEngine",
    capabilities: [{ name: "asset-management" }],
    isActive: true,
  },
  {
    id: "manage-workflow",
    name: "Manage Workflow",
    description: "Create and manage approval workflows",
    category: "workflow",
    provider: "engine",
    providerRef: "WorkflowEngine",
    capabilities: [{ name: "workflow-management" }],
    isActive: true,
  },
  {
    id: "load-brand",
    name: "Load Brand",
    description: "Load brand kit configuration",
    category: "brand",
    provider: "engine",
    providerRef: "BrandKitEngine",
    capabilities: [{ name: "brand-lookup" }],
    isActive: true,
  },
];

export function registerDefaultTools(registry: ToolRegistry = toolRegistry): void {
  for (const tool of DEFAULT_TOOLS) registry.register(tool);
}
