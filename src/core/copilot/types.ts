/** Calixo Platform — Enterprise AI Copilot Types */

export type TaskStatus = "queued" | "running" | "completed" | "failed";
export type ToolCategory = "content" | "creative" | "media" | "analysis" | "library" | "asset" | "workflow" | "brand" | "intelligence";

export interface CopilotTool {
  id: string; name: string; category: ToolCategory; description: string;
  engineRef: string; params: Record<string, unknown>;
}

export interface PlanStep {
  id: string; order: number; toolId: string; label: string; description: string;
  enabled: boolean; status: TaskStatus; result?: string; engineUsed?: string;
  estimatedTimeMs: number; actualTimeMs?: number;
}

export interface ExecutionPlan {
  id: string; title: string; steps: PlanStep[]; createdAt: string; estimatedTotalMs: number;
}

export interface CopilotMessage {
  id: string; role: "user" | "copilot" | "system"; content: string; timestamp: string;
  plan?: ExecutionPlan; suggestions?: string[];
}

export interface CopilotMemory {
  brand?: string; campaign?: string; audience?: string; region?: string;
  language?: string; tone?: string; platform?: string; creativeType?: string;
  recentTasks: string[]; recentAssets: string[]; recentWorkflows: string[];
}

export interface CopilotSession {
  id: string; messages: CopilotMessage[]; memory: CopilotMemory; plan?: ExecutionPlan;
  createdAt: string; updatedAt: string;
}

export interface CopilotDashboard {
  tasksToday: number; successRate: number; avgCompletionMs: number;
  assetsGenerated: number; contentGenerated: number; imagesGenerated: number;
  workflowsStarted: number;
}