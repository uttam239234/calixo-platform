/**
 * Calixo Platform - AI Conversation Engine
 *
 * Replaces `PlannerEngine.run()`'s keyword-trigger routing
 * (`skillRegistry.discover(request)` matching a request against literal
 * substring `triggers`, falling back to "I don't have a capability that
 * matches that request" when nothing matched) as Copilot's primary
 * decision-making path. A real model now decides whether to answer
 * directly or call one of Copilot's real tools — via genuine OpenAI/
 * Anthropic function-calling, not string matching.
 *
 * `PlannerEngine` itself is NOT deleted: `compose()` is still used by
 * `CopilotPlatformAPI.approveStep()` to describe the result of a step the
 * user has just approved, which is a real, separate, still-useful piece of
 * behavior this round doesn't touch.
 *
 * Real tool execution still goes through Copilot's OWN `ToolRegistry`
 * (wired to real business-data handlers across every module) — not AIOS's
 * own, separate, unpopulated `ToolRegistry`. `AIService.chat()` (a single
 * completion, no built-in tool loop) is called directly here instead of
 * `chatWithTools()`, specifically so tool execution can be intercepted for
 * `requiresApproval` gating before anything runs.
 */
import { generateId } from "@/shared/utils/string";
import { aiService } from "@/aios/services/AIService";
import type { AIMessage, ToolDefinition, AIProvider, AIModel } from "@/aios/types";
import { appendConversationMessage, getConversation, recordAIRequest } from "@/aios/persistence";
import { listConnectorInstancesAction } from "@/core/connectors/actions";
import { toolRegistry, ToolRegistry } from "../tools/ToolRegistry";
import { skillRegistry, SkillRegistry } from "../skills/SkillRegistry";
import type { ExecutionStep, ExecutionTask, PlatformTool } from "../types/index";

const MAX_TOOL_ITERATIONS = 4;
const GENERIC_TOOL_SCHEMA: Record<string, unknown> = {
  type: "object",
  properties: {
    query: { type: "string", description: "The user's exact request or instruction, in their own words — pass it through as-is so the tool can extract any details it needs (amounts, dates, names)." },
  },
  required: [],
};

export interface AIConversationActor {
  userId: string;
  organizationId: string;
}

export interface AIConversationOutcome {
  responseText: string;
  agentId?: string;
  pendingApprovalSteps: ExecutionStep[];
  tasks: ExecutionTask[];
  provider?: AIProvider;
  model?: AIModel;
  totalTokens: number;
  latencyMs: number;
}

function toolToDefinition(tool: PlatformTool): ToolDefinition {
  return {
    type: "function",
    function: {
      name: tool.id,
      description: tool.description,
      parameters: tool.inputSchema ?? GENERIC_TOOL_SCHEMA,
    },
  };
}

function stepFromTool(tool: PlatformTool, args: Record<string, unknown>, agentId: string | undefined): ExecutionStep {
  return {
    id: generateId(12),
    order: 1,
    skillId: tool.id,
    toolId: tool.id,
    label: tool.name,
    description: tool.description,
    input: args,
    enabled: true,
    estimatedTimeMs: 1000,
    agentId,
    requiresApproval: true,
  };
}

function taskFromExecution(tool: PlatformTool, success: boolean, data: unknown, error: string | undefined, durationMs: number): ExecutionTask {
  return {
    id: generateId(12),
    planId: "ai-conversation",
    stepId: tool.id,
    toolId: tool.id,
    label: tool.name,
    state: success ? "completed" : "failed",
    progress: 100,
    estimatedTimeMs: durationMs,
    actualTimeMs: durationMs,
    result: data,
    error,
    retryCount: 0,
    maxRetries: 0,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

/** Real per-org integration status — the brief's Part 4 ("tool awareness"). Built from live `getConnections()`, not a per-tool hardcoded map, so it stays correct as connectors are added/removed without editing this file. `listConnectorInstancesAction()` derives the org from the real signed-in session itself via `resolveIdentity()`. */
async function buildIntegrationsBlock(): Promise<string> {
  try {
    const instances = await listConnectorInstancesAction();
    const connected = instances.filter(i => i.status === "active").map(i => i.displayName);
    const other = instances.filter(i => i.status !== "active").map(i => `${i.displayName} (${i.status})`);
    if (connected.length === 0 && other.length === 0) {
      return "No integrations are connected for this organization yet.";
    }
    const lines = [];
    if (connected.length > 0) lines.push(`Connected integrations: ${connected.join(", ")}.`);
    if (other.length > 0) lines.push(`Not fully connected: ${other.join(", ")}.`);
    return lines.join(" ");
  } catch {
    return "Integration status could not be determined for this request.";
  }
}

function buildSystemPrompt(integrationsBlock: string): string {
  return [
    "You are Calixo AI, the AI Copilot for Calixo — an enterprise marketing growth operating system covering Analytics, Ads, Social Media, Brand Monitoring, Content Studio, Reports, and Workflow approvals.",
    "You have real tools available for reading and acting on this organization's real data. Call a tool whenever the user's request needs real data or a real action — never invent numbers, campaign names, or metrics; only state facts a tool has actually returned.",
    integrationsBlock,
    "If the user asks about a platform, channel, or data source that is not in the connected-integrations list above, do NOT say you lack that capability. Instead, tell them specifically which integration to connect and exactly where: \"Connect it under Settings → Integrations → <name>.\"",
    "If no tool applies and the question is a general marketing/product question, just answer directly and helpfully — you are not limited to a fixed list of topics.",
    "Some tools perform real write actions (pausing/publishing/deleting/changing budgets) and require explicit user approval before they run — if you call one of these, tell the user plainly that you need their approval and briefly what it will do; do not claim the action already happened.",
    "Be concise and concrete. Prefer real numbers and specific next steps over generic advice.",
  ].join("\n\n");
}

/** Reverse-derived from real skill registrations (`skill.toolIds` -> `skill.agentId`) so agent attribution reflects each module's own real metadata rather than a second, hand-maintained mapping. */
function buildToolAgentMap(skills: SkillRegistry): Map<string, string> {
  const map = new Map<string, string>();
  for (const skill of skills.list()) {
    if (!skill.agentId) continue;
    for (const toolId of skill.toolIds) map.set(toolId, skill.agentId);
  }
  return map;
}

export class AIConversationEngine {
  constructor(
    private tools: ToolRegistry = toolRegistry,
    private skills: SkillRegistry = skillRegistry
  ) {}

  async run(actor: AIConversationActor, sessionId: string, request: string): Promise<AIConversationOutcome> {
    const stored = await getConversation(sessionId);
    const history: AIMessage[] = stored?.messages ?? [];
    const toolAgentMap = buildToolAgentMap(this.skills);

    const availableTools = this.tools.list().filter(t => t.isActive);
    const toolDefinitions = availableTools.map(toolToDefinition);
    const integrationsBlock = await buildIntegrationsBlock();
    const systemMessage: AIMessage = { id: generateId(16), role: "system", content: buildSystemPrompt(integrationsBlock), timestamp: new Date().toISOString() };
    const userMessage: AIMessage = { id: generateId(16), role: "user", content: request, timestamp: new Date().toISOString() };

    await appendConversationMessage({ conversationId: sessionId, organizationId: actor.organizationId, userId: actor.userId, module: "ai-copilot", message: userMessage });

    let conversation: AIMessage[] = [systemMessage, ...history, userMessage];
    const pendingApprovalSteps: ExecutionStep[] = [];
    const tasks: ExecutionTask[] = [];
    let agentId: string | undefined;
    let finalText = "";
    let lastProvider: AIProvider | undefined;
    let lastModel: AIModel | undefined;
    let totalTokens = 0;
    let totalLatency = 0;
    let fallbackActivated = false;

    try {
      for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
        const response = await aiService.chat(
          { messages: conversation, tools: toolDefinitions.length > 0 ? toolDefinitions : undefined, userId: actor.userId, organizationId: actor.organizationId, sessionId },
          { userId: actor.userId, organizationId: actor.organizationId, module: "ai-copilot" }
        );

        lastProvider = response.provider;
        lastModel = response.model;
        totalTokens += response.usage.totalTokens;
        totalLatency += response.latency;
        if (response.provider !== "openai") fallbackActivated = true;

        const toolCalls = response.message.toolCalls;
        if (!toolCalls || toolCalls.length === 0) {
          finalText = response.message.content;
          conversation = [...conversation, response.message];
          break;
        }

        conversation = [...conversation, response.message];
        let approvalRequested = false;

        for (const call of toolCalls) {
          const tool = this.tools.lookup(call.function.name);
          if (!tool) {
            conversation.push({ id: generateId(16), role: "tool", content: JSON.stringify({ error: `Tool not found: ${call.function.name}` }), toolCallId: call.id, timestamp: new Date().toISOString() });
            continue;
          }
          if (!agentId) agentId = toolAgentMap.get(tool.id);

          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(call.function.arguments || "{}");
          } catch {
            args = {};
          }

          if (tool.requiresApproval) {
            pendingApprovalSteps.push(stepFromTool(tool, { request: args.query ?? request, ...args }, agentId));
            conversation.push({ id: generateId(16), role: "tool", content: JSON.stringify({ status: "awaiting_approval", message: "This action requires user approval and has not been run yet." }), toolCallId: call.id, timestamp: new Date().toISOString() });
            approvalRequested = true;
            continue;
          }

          const result = await this.tools.execute(tool.id, { request: args.query ?? request, ...args });
          tasks.push(taskFromExecution(tool, result.success, result.data, result.error, result.durationMs));
          conversation.push({ id: generateId(16), role: "tool", content: JSON.stringify(result.success ? result.data : { error: result.error }), toolCallId: call.id, timestamp: new Date().toISOString() });
        }

        if (approvalRequested) {
          // Ask the model to phrase the "needs approval" message using the real tool descriptions already fed back above, rather than looping further.
          const followUp = await aiService.chat(
            { messages: conversation, userId: actor.userId, organizationId: actor.organizationId, sessionId },
            { userId: actor.userId, organizationId: actor.organizationId, module: "ai-copilot" }
          );
          totalTokens += followUp.usage.totalTokens;
          totalLatency += followUp.latency;
          finalText = followUp.message.content;
          break;
        }
      }

      if (!finalText) finalText = "I looked into that but couldn't put together a complete answer — could you rephrase or give me a bit more detail?";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "The AI provider request failed.";

      // Real failure (verified live: a vendor billing/quota rejection surfaces here) — log it
      // for real (Part 11's "Failures" metric), but do NOT persist a fake assistant message
      // containing the raw vendor error text (confusing to a business user who doesn't manage
      // API billing) and do NOT let the caller commit credits for a call that never actually
      // produced a response — re-throw so `sendCopilotMessageAction` releases the reservation
      // and shows its own clean, generic error instead.
      await recordAIRequest({
        conversationId: sessionId,
        organizationId: actor.organizationId,
        userId: actor.userId,
        module: "ai-copilot",
        provider: lastProvider ?? "openai",
        model: lastModel ?? "gpt-4o-mini",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens,
        creditsUsed: 0,
        latencyMs: totalLatency,
        success: false,
        error: errorMessage,
        fallbackActivated,
      });
      throw error;
    }

    const assistantMessage: AIMessage = { id: generateId(16), role: "assistant", content: finalText, timestamp: new Date().toISOString() };
    await appendConversationMessage({ conversationId: sessionId, organizationId: actor.organizationId, userId: actor.userId, module: "ai-copilot", message: assistantMessage });

    await recordAIRequest({
      conversationId: sessionId,
      messageId: assistantMessage.id,
      organizationId: actor.organizationId,
      userId: actor.userId,
      module: "ai-copilot",
      provider: lastProvider ?? "openai",
      model: lastModel ?? "gpt-4o-mini",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens,
      creditsUsed: totalTokens,
      latencyMs: totalLatency,
      success: true,
      fallbackActivated,
    });

    return {
      responseText: finalText,
      agentId,
      pendingApprovalSteps,
      tasks,
      provider: lastProvider,
      model: lastModel,
      totalTokens,
      latencyMs: totalLatency,
    };
  }
}

export const aiConversationEngine = new AIConversationEngine();
