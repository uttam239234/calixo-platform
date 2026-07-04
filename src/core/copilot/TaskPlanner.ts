/** Calixo Platform — Copilot Task Planner */
import type { ExecutionPlan, PlanStep } from "./types";
import { ToolRegistry } from "./ToolRegistry";

function step(toolId: string, order: number, label: string, desc: string, estMs: number): PlanStep {
  return { id: `step-${Date.now()}-${order}`, order, toolId, label, description: desc, enabled: true, status: "queued", estimatedTimeMs: estMs };
}

export const TaskPlanner = {
  plan(userRequest: string): ExecutionPlan {
    const q = userRequest.toLowerCase();
    const steps: PlanStep[] = [];

    if (q.includes("campaign") || q.includes("marketing") || q.includes("launch")) {
      steps.push(step("load-brand", 1, "Load Brand Kit", "Load brand configuration and guidelines", 200));
      steps.push(step("generate-content", 2, "Generate Campaign Brief", "Create campaign strategy document", 1500));
      steps.push(step("generate-content", 3, "Generate Content", "Create marketing content assets", 2000));
    }
    if (q.includes("creative") || q.includes("instagram") || q.includes("social") || q.includes("ad")) {
      if (steps.length === 0) steps.push(step("load-brand", 1, "Load Brand Kit", "Load brand configuration", 200));
      steps.push(step("generate-creative", 4, "Generate Creative Document", "Create layout blueprint with creative prompt", 1000));
      steps.push(step("generate-image", 5, "Generate Images", "Generate 4 AI image variations", 3000));
      steps.push(step("manage-assets", 6, "Save Assets", "Store generated assets in platform", 500));
    }
    if (q.includes("improve") || q.includes("analyze") || q.includes("rewrite") || q.includes("optimize")) {
      if (steps.length === 0) steps.push(step("load-brand", 1, "Load Brand Kit", "Load brand configuration", 200));
      steps.push(step("analyze-content", 3, "Analyze Content", "Run AI content intelligence analysis", 1200));
      steps.push(step("run-intelligence", 4, "Run Intelligence Report", "Generate full optimization report", 800));
    }
    if (q.includes("workflow") || q.includes("approval") || q.includes("review")) {
      if (steps.length === 0) steps.push(step("load-brand", 1, "Load Brand Kit", "Load brand configuration", 200));
      steps.push(step("start-workflow", 5, "Create Approval Workflow", "Set up review and approval process", 600));
    }
    if (q.includes("search") || q.includes("find") || q.includes("library")) {
      steps.push(step("search-library", 1, "Search Library", "Find resources in Marketing Resource Hub", 500));
    }

    // Always append these if steps exist
    if (steps.length > 0 && !steps.some(s => s.toolId === "run-intelligence")) {
      steps.push(step("run-intelligence", 7, "Run Intelligence Check", "Final quality and brand compliance check", 800));
    }
    if (steps.length > 0 && !steps.some(s => s.toolId === "manage-assets")) {
      steps.push(step("manage-assets", 8, "Save to Asset Platform", "Store all outputs in enterprise asset system", 500));
    }
    if (steps.length === 0) {
      steps.push(step("generate-content", 1, "Generate Content", "Create marketing content", 1500));
      steps.push(step("run-intelligence", 2, "Analyze Content", "Run intelligence analysis", 800));
    }

    return {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: userRequest.slice(0, 80),
      steps: steps.sort((a, b) => a.order - b.order),
      createdAt: new Date().toISOString(),
      estimatedTotalMs: steps.reduce((s, st) => s + st.estimatedTimeMs, 0),
    };
  },
};