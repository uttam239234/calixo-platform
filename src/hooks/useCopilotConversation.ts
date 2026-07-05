"use client";

/**
 * Calixo AI Copilot Workspace - conversation state.
 * Orchestrates ConversationEngine (message history) and PlannerEngine
 * (understand/clarify/plan/tool-selection/validate/response) — it holds
 * no business logic of its own, only the glue between the two.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { conversationEngine, plannerEngine } from "@/core/copilot";
import type { ConversationMessage, ExecutionPlan, PlannerResult } from "@/core/copilot";
import type { CopilotMessageView, MessageReaction } from "@/components/copilot/types";

export function useCopilotConversation(sessionId: string | null, conversationId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastResult, setLastResult] = useState<PlannerResult | null>(null);
  const [reactions, setReactions] = useState<Record<string, MessageReaction>>({});
  const [plansByMessageId, setPlansByMessageId] = useState<Record<string, ExecutionPlan>>({});
  const [promptByAssistantId, setPromptByAssistantId] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    setMessages(conversationId ? conversationEngine.getMessages(conversationId) : []);
  }, [conversationId]);

  useEffect(() => {
    (async () => {
      refresh();
      setLastResult(null);
    })();
  }, [refresh]);

  const runPlanner = useCallback(
    async (request: string): Promise<PlannerResult> => {
      if (!sessionId) throw new Error("No active session");
      const result = await plannerEngine.run({ sessionId, request });
      setLastResult(result);
      return result;
    },
    [sessionId]
  );

  const appendAssistantReply = useCallback(
    (convId: string, result: PlannerResult, promptMessageId: string) => {
      const assistantMsg = conversationEngine.addMessage(convId, { role: "assistant", content: result.responseText });
      if (result.clarificationsNeeded.length === 0) {
        setPlansByMessageId(prev => ({ ...prev, [assistantMsg.id]: result.plan }));
      }
      setPromptByAssistantId(prev => ({ ...prev, [assistantMsg.id]: promptMessageId }));
      refresh();
      return assistantMsg;
    },
    [refresh]
  );

  const sendMessage = useCallback(
    async (text: string): Promise<PlannerResult | null> => {
      const trimmed = text.trim();
      if (!conversationId || !trimmed) return null;
      const userMsg = conversationEngine.addMessage(conversationId, { role: "user", content: trimmed });
      refresh();
      setIsThinking(true);
      try {
        const result = await runPlanner(trimmed);
        appendAssistantReply(conversationId, result, userMsg.id);
        return result;
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId, refresh, runPlanner, appendAssistantReply]
  );

  const regenerate = useCallback(
    async (assistantMessageId: string): Promise<PlannerResult | null> => {
      if (!conversationId) return null;
      const promptMessageId = promptByAssistantId[assistantMessageId];
      const promptMessage = messages.find(m => m.id === promptMessageId);
      if (!promptMessage) return null;

      conversationEngine.removeMessage(conversationId, assistantMessageId);
      setPlansByMessageId(prev => {
        const next = { ...prev };
        delete next[assistantMessageId];
        return next;
      });
      setPromptByAssistantId(prev => {
        const next = { ...prev };
        delete next[assistantMessageId];
        return next;
      });
      refresh();
      setIsThinking(true);
      try {
        const result = await runPlanner(promptMessage.content);
        appendAssistantReply(conversationId, result, promptMessage.id);
        return result;
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId, messages, promptByAssistantId, refresh, runPlanner, appendAssistantReply]
  );

  const setReaction = useCallback((messageId: string, reaction: Exclude<MessageReaction, null>) => {
    setReactions(prev => ({ ...prev, [messageId]: prev[messageId] === reaction ? null : reaction }));
  }, []);

  const views: CopilotMessageView[] = useMemo(
    () =>
      messages.map(m => ({
        ...m,
        reaction: reactions[m.id] ?? null,
        plan: plansByMessageId[m.id],
        promptMessageId: promptByAssistantId[m.id],
      })),
    [messages, reactions, plansByMessageId, promptByAssistantId]
  );

  return { messages: views, isThinking, lastResult, sendMessage, regenerate, setReaction };
}
