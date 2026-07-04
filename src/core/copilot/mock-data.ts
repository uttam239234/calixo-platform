/** Calixo Platform — Copilot Mock Data */
import type { CopilotSession, CopilotMessage } from "./types";

const SUGGESTIONS = [
  "Create an MBA admissions campaign for RGU",
  "Generate Instagram creatives for Q4 launch",
  "Improve this landing page copy for better conversions",
  "Generate Google Search Ads for Calixo platform",
  "Rewrite this content in a professional tone",
  "Create a full brand campaign for Demo Enterprise",
  "Analyze my content and suggest improvements",
  "Generate 4 social media image variations",
  "Start an approval workflow for my latest creative",
  "Search library for Q2 campaign assets",
  "Load Royal Global University brand kit",
  "Run content intelligence on my landing page",
];

function genPlanId(): string { return `plan-${Date.now()}`; }

export function createMockSession(): CopilotSession {
  const messages: CopilotMessage[] = [
    { id: "msg-1", role: "system", content: "Welcome to the Calixo AI Copilot. I can orchestrate campaigns, generate content, create creatives, produce images, manage assets, and run workflows.", timestamp: new Date().toISOString(), suggestions: SUGGESTIONS.slice(0, 6) },
  ];
  return {
    id: `session-${Date.now()}`, messages,
    memory: { brand: "Calixo", campaign: "Q3 Content Strategy", audience: "Enterprise Marketers", region: "Global", language: "English", tone: "Professional", recentTasks: [], recentAssets: [], recentWorkflows: [] },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
}