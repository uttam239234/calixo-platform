/** Calixo Platform — Copilot Tool Registry (Wraps existing engines) */
import type { CopilotTool } from "./types";

const TOOLS: CopilotTool[] = [
  { id: "generate-content", name: "Generate Content", category: "content", description: "Generate marketing content using AI", engineRef: "GenerationEngine", params: {} },
  { id: "generate-creative", name: "Generate Creative", category: "creative", description: "Create creative document with layout blueprint", engineRef: "CreativeEngine", params: {} },
  { id: "generate-image", name: "Generate Image", category: "media", description: "Generate AI image from prompt", engineRef: "MediaGenerationEngine", params: {} },
  { id: "analyze-content", name: "Analyze Content", category: "analysis", description: "Run AI-powered content intelligence", engineRef: "ContentIntelligenceEngine", params: {} },
  { id: "search-library", name: "Search Library", category: "library", description: "Search Marketing Resource Hub", engineRef: "LibraryEngine", params: {} },
  { id: "manage-assets", name: "Manage Assets", category: "asset", description: "Store and retrieve assets", engineRef: "AssetEngine", params: {} },
  { id: "start-workflow", name: "Start Workflow", category: "workflow", description: "Create approval workflow", engineRef: "WorkflowEngine", params: {} },
  { id: "load-brand", name: "Load Brand", category: "brand", description: "Load brand kit configuration", engineRef: "BrandKitEngine", params: {} },
  { id: "run-intelligence", name: "Run Intelligence", category: "intelligence", description: "Run full content intelligence analysis", engineRef: "ContentIntelligenceEngine", params: {} },
  { id: "search-campaigns", name: "Search Campaigns", category: "library", description: "Find campaigns and related assets", engineRef: "LibraryEngine", params: {} },
  { id: "approve-workflow", name: "Approve Workflow", category: "workflow", description: "Approve pending workflow", engineRef: "WorkflowEngine", params: {} },
];

export const ToolRegistry = {
  getAll(): CopilotTool[] { return [...TOOLS]; },
  get(id: string): CopilotTool | undefined { return TOOLS.find(t => t.id === id); },
  getByCategory(cat: string): CopilotTool[] { return TOOLS.filter(t => t.category === cat); },
  getNames(): string[] { return TOOLS.map(t => t.name); },
};