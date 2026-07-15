"use client";

/**
 * Calixo AI Copilot Workspace - conversation state.
 * Orchestrates ConversationEngine (message history) and `copilotPlatformAPI.sendMessage`
 * (plan -> auto-run reads -> compose a real response -> hold writes for approval) — it holds
 * no business logic of its own, only the glue between the two.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { conversationEngine } from "@/core/copilot";
import type { ConversationMessage, ExecutionPlan, ExecutionStep, SendMessageOutcome } from "@/core/copilot";
import type { CopilotAttachment, CopilotMessageView, MessageReaction } from "@/components/copilot/types";
import { sendCopilotMessageAction } from "@/features/copilot/actions";

export function useCopilotConversation(sessionId: string | null, conversationId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastResult, setLastResult] = useState<SendMessageOutcome | null>(null);
  const [reactions, setReactions] = useState<Record<string, MessageReaction>>({});
  const [plansByMessageId, setPlansByMessageId] = useState<Record<string, ExecutionPlan>>({});
  const [promptByAssistantId, setPromptByAssistantId] = useState<Record<string, string>>({});
  const [approvalStepsByMessageId, setApprovalStepsByMessageId] = useState<Record<string, ExecutionStep[]>>({});

  const refresh = useCallback(() => {
    setMessages(conversationId ? conversationEngine.getMessages(conversationId) : []);
  }, [conversationId]);

  useEffect(() => {
    (async () => {
      refresh();
      setLastResult(null);
    })();
  }, [refresh]);

  const runPipeline = useCallback(
    async (request: string): Promise<SendMessageOutcome> => {
      if (!sessionId) throw new Error("No active session");
      // Real backend enforcement boundary — see `sendCopilotMessageAction`'s
      // doc comment. Never calls `copilotPlatformAPI.sendMessage()` directly
      // from client code.
      const actionResult = await sendCopilotMessageAction(sessionId, request);
      if (!actionResult.ok || !actionResult.outcome) throw new Error(actionResult.error ?? "Something went wrong sending that message.");
      setLastResult(actionResult.outcome);
      return actionResult.outcome;
    },
    [sessionId]
  );

  const appendAssistantReply = useCallback(
    (convId: string, result: SendMessageOutcome, promptMessageId: string) => {
      const assistantMsg = conversationEngine.addMessage(convId, {
        role: "assistant",
        content: result.responseText,
        metadata: { agentId: result.agentId, citation: result.citation, clarificationOptions: result.clarificationOptions },
      });
      if (!result.awaitingClarification) {
        setPlansByMessageId(prev => ({ ...prev, [assistantMsg.id]: result.plan }));
      }
      if (result.pendingApprovalSteps.length > 0) {
        setApprovalStepsByMessageId(prev => ({ ...prev, [assistantMsg.id]: result.pendingApprovalSteps }));
      }
      setPromptByAssistantId(prev => ({ ...prev, [assistantMsg.id]: promptMessageId }));
      refresh();
      return assistantMsg;
    },
    [refresh]
  );

  const sendMessage = useCallback(
    async (text: string, attachments: CopilotAttachment[] = []): Promise<SendMessageOutcome | null> => {
      const trimmed = text.trim();
      if (!conversationId || !trimmed) return null;
      const userMsg = conversationEngine.addMessage(conversationId, {
        role: "user",
        content: trimmed,
        metadata: attachments.length > 0 ? { attachments } : undefined,
      });
      refresh();
      setIsThinking(true);
      try {
        const result = await runPipeline(trimmed);
        appendAssistantReply(conversationId, result, userMsg.id);
        return result;
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId, refresh, runPipeline, appendAssistantReply]
  );

  const regenerate = useCallback(
    async (assistantMessageId: string): Promise<SendMessageOutcome | null> => {
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
      setApprovalStepsByMessageId(prev => {
        const next = { ...prev };
        delete next[assistantMessageId];
        return next;
      });
      refresh();
      setIsThinking(true);
      try {
        const result = await runPipeline(promptMessage.content);
        appendAssistantReply(conversationId, result, promptMessage.id);
        return result;
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId, messages, promptByAssistantId, refresh, runPipeline, appendAssistantReply]
  );

  /** Removes a resolved step from its pending-approval card and appends the real outcome (from `approveStep`/`rejectStep`) as a follow-up assistant message. */
  const finalizeApprovalStep = useCallback(
    (assistantMessageId: string, stepId: string, responseText: string) => {
      setApprovalStepsByMessageId(prev => {
        const remaining = (prev[assistantMessageId] ?? []).filter(s => s.id !== stepId);
        const next = { ...prev };
        if (remaining.length > 0) next[assistantMessageId] = remaining;
        else delete next[assistantMessageId];
        return next;
      });
      if (conversationId) {
        conversationEngine.addMessage(conversationId, { role: "assistant", content: responseText });
        refresh();
      }
    },
    [conversationId, refresh]
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
        pendingApprovalSteps: approvalStepsByMessageId[m.id],
        attachments: (m.metadata as { attachments?: CopilotAttachment[] } | undefined)?.attachments,
      })),
    [messages, reactions, plansByMessageId, promptByAssistantId, approvalStepsByMessageId]
  );

  return { messages: views, isThinking, lastResult, sendMessage, regenerate, setReaction, finalizeApprovalStep };
}
