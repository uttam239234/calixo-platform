/** Calixo Platform — Enterprise AI Copilot Engine */
import type { CopilotSession, CopilotMessage, CopilotMemory, CopilotDashboard, ExecutionPlan, PlanStep, CopilotTool } from "./types";
import { createMockSession } from "./mock-data";
import { TaskPlanner } from "./TaskPlanner";
import { TaskExecutor } from "./TaskExecutor";
import { ToolRegistry } from "./ToolRegistry";

const sessions = new Map<string, CopilotSession>();

function mockResponse(request: string): string {
  const responses: Record<string, string> = {
    campaign: "I'll orchestrate a complete marketing campaign for you. Here's my execution plan:",
    creative: "Let me generate professional creatives for your campaign. I'll create layout blueprints and optimized prompts.",
    improve: "I'll analyze your content and apply AI-powered optimizations across SEO, readability, brand voice, and conversion.",
    search: "Let me search the Marketing Resource Hub for relevant assets and resources.",
    default: "I'll orchestrate the right Calixo engines to handle this task. Here's what I'll do:",
  };
  for (const [key, val] of Object.entries(responses)) {
    if (request.toLowerCase().includes(key)) return val;
  }
  return responses.default;
}

export const CopilotEngine = {
  createSession(): CopilotSession {
    const session = createMockSession();
    sessions.set(session.id, session);
    return session;
  },

  getSession(id: string): CopilotSession | undefined { return sessions.get(id); },

  async sendMessage(sessionId: string, userMessage: string): Promise<{ response: CopilotMessage; plan: ExecutionPlan }> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    // Add user message
    const userMsg: CopilotMessage = { id: `msg-${Date.now()}`, role: "user", content: userMessage, timestamp: new Date().toISOString() };
    session.messages.push(userMsg);

    // Generate plan
    const plan = TaskPlanner.plan(userMessage);
    session.plan = plan;

    // Generate response
    const responseText = mockResponse(userMessage);
    const response: CopilotMessage = {
      id: `msg-${Date.now() + 1}`, role: "copilot", content: responseText, timestamp: new Date().toISOString(),
      plan, suggestions: ["Regenerate with different tone", "Add more steps", "Skip image generation", "Run faster"],
    };
    session.messages.push(response);
    session.updatedAt = new Date().toISOString();

    return { response, plan };
  },

  async executePlan(sessionId: string, onProgress: (stepId: string, status: import("./types").TaskStatus, result?: string) => void): Promise<void> {
    const session = sessions.get(sessionId);
    if (!session?.plan) throw new Error("No plan to execute");
    await TaskExecutor.execute(session.plan, onProgress);
  },

  updateMemory(sessionId: string, memory: Partial<CopilotMemory>): void {
    const session = sessions.get(sessionId); if (!session) return;
    Object.assign(session.memory, memory);
    session.updatedAt = new Date().toISOString();
  },

  getDashboard(): CopilotDashboard {
    return { tasksToday: 24, successRate: 96, avgCompletionMs: 3800, assetsGenerated: 156, contentGenerated: 89, imagesGenerated: 42, workflowsStarted: 18 };
  },

  getTools(): CopilotTool[] { return ToolRegistry.getAll(); },

  getSuggestedPrompts(): string[] {
    return [
      "Create an MBA admissions campaign for RGU", "Generate Instagram creatives for Q4 launch",
      "Improve this landing page copy for better conversions", "Generate Google Search Ads for Calixo",
      "Rewrite this content in a professional tone", "Create a full brand campaign",
      "Analyze my content and suggest improvements", "Generate 4 social media image variations",
    ];
  },
};