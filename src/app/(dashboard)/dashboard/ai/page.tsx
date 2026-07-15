"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCopilotSessions } from "@/hooks/useCopilotSessions";
import { useCopilotConversation } from "@/hooks/useCopilotConversation";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useCopilotExecution } from "@/hooks/useCopilotExecution";
import {
  CopilotSidebar,
  CopilotChatHeader,
  CopilotMessageList,
  CopilotComposer,
  CopilotContextDrawer,
  CopilotPowerUserDrawer,
  buildPipelineStages,
  classifyAttachment,
  type CopilotAttachment,
} from "@/components/copilot";
import { useCopilot } from "@/features/copilot/CopilotProvider";
import { DEFAULT_MODEL_CONFIG } from "@/aios/types";
import type { ClarificationOption, ExecutionStep } from "@/core/copilot";

export default function CopilotPage() {
  const { tenantContext, mode, toggleMode, canExecute, recordMessageOutcome, approveStep, rejectStep, showToast } = useCopilot();
  const sessions = useCopilotSessions(tenantContext.workspaceId, tenantContext.userId);
  const conversation = useCopilotConversation(sessions.currentSessionId, sessions.currentSession?.conversationId ?? null);
  const workspaceContext = useWorkspaceContext(sessions.currentSessionId);
  const execution = useCopilotExecution();

  const [input, setInput] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<CopilotAttachment[]>([]);
  const [contextOpen, setContextOpen] = useState(false);
  const [resolvingStepId, setResolvingStepId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setInput((e as CustomEvent<string>).detail);
    window.addEventListener("copilot-command-palette:insert-prompt", handler);
    return () => window.removeEventListener("copilot-command-palette:insert-prompt", handler);
  }, []);

  const lastResult = conversation.lastResult;
  const currentPlan = lastResult && !lastResult.awaitingClarification ? lastResult.plan : undefined;
  const tasks = useMemo(() => (currentPlan ? execution.getTasks(currentPlan.id) : []), [currentPlan, execution]);
  const isRunningCurrent = currentPlan ? execution.runningPlanId === currentPlan.id : false;

  const executionStageStatus = useMemo(() => {
    if (!currentPlan || tasks.length === 0) return "pending" as const;
    if (tasks.some(t => t.state === "running")) return "running" as const;
    if (tasks.some(t => t.state === "failed")) return "failed" as const;
    if (tasks.every(t => t.state === "completed")) return "completed" as const;
    return "running" as const;
  }, [currentPlan, tasks]);

  const executionProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
  }, [tasks]);

  const pipelineStages = useMemo(
    () => buildPipelineStages(lastResult, executionStageStatus, executionProgress),
    [lastResult, executionStageStatus, executionProgress]
  );

  const handleAttach = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setAttachments(prev => [...prev, { id: `${file.name}-${Date.now()}-${prev.length}`, name: file.name, kind: classifyAttachment(file), dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    const text = input;
    if (!text.trim()) return;
    if (!canExecute) {
      showToast("You don't have permission to run AI actions.");
      return;
    }
    setInput("");
    const sentAttachments = attachments;
    setAttachments([]);
    const startedAt = Date.now();
    try {
      const result = await conversation.sendMessage(text, sentAttachments);
      if (result) recordMessageOutcome(text, result, Date.now() - startedAt);
      await workspaceContext.pushRecentChat(text.slice(0, 60));
    } catch (error) {
      // Real denials from `sendCopilotMessageAction` (out of AI credits, plan
      // doesn't include AI Copilot) surface here, not a generic error.
      showToast(error instanceof Error ? error.message : "Something went wrong sending that message.");
    }
  }, [input, attachments, canExecute, conversation, workspaceContext, recordMessageOutcome, showToast]);

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      setRegeneratingId(messageId);
      try {
        await conversation.regenerate(messageId);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Something went wrong regenerating that response.");
      } finally {
        setRegeneratingId(null);
      }
    },
    [conversation, showToast]
  );

  const handleRunPlan = useCallback(() => {
    if (currentPlan) execution.runPlan(currentPlan);
  }, [currentPlan, execution]);

  const handleSuggestedAction = useCallback((label: string) => setInput(label), []);
  const handleSelectClarificationOption = useCallback((option: ClarificationOption) => setInput(option.label), []);

  const handleApproveStep = useCallback(
    async (messageId: string, step: ExecutionStep) => {
      setResolvingStepId(step.id);
      try {
        const outcome = await approveStep(step);
        conversation.finalizeApprovalStep(messageId, step.id, outcome?.responseText ?? "Something went wrong approving that.");
      } finally {
        setResolvingStepId(null);
      }
    },
    [approveStep, conversation]
  );

  const handleRejectStep = useCallback(
    (messageId: string, step: ExecutionStep) => {
      const outcome = rejectStep(step);
      conversation.finalizeApprovalStep(messageId, step.id, outcome?.responseText ?? "Okay, cancelled.");
    },
    [rejectStep, conversation]
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <CopilotSidebar
        active={sessions.active}
        pinned={sessions.pinned}
        archived={sessions.archived}
        deleted={sessions.deletedSessions}
        currentSessionId={sessions.currentSessionId}
        onSelect={sessions.selectSession}
        onCreate={() => sessions.createSession()}
        onRename={sessions.renameSession}
        onPin={sessions.pinSession}
        onUnpin={sessions.unpinSession}
        onArchive={sessions.archiveSession}
        onUnarchive={sessions.unarchiveSession}
        onDelete={sessions.deleteSession}
        onRestore={sessions.restoreSession}
      />

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-border bg-card">
        <CopilotChatHeader
          session={sessions.currentSession}
          model={DEFAULT_MODEL_CONFIG.model}
          mode={mode}
          onToggleMode={toggleMode}
          onOpenContext={() => setContextOpen(true)}
          onOpenSearch={() => window.dispatchEvent(new Event("copilot-command-palette:toggle"))}
        />
        <CopilotMessageList
          messages={conversation.messages}
          isThinking={conversation.isThinking}
          regeneratingId={regeneratingId}
          onRegenerate={handleRegenerate}
          onReact={conversation.setReaction}
          onEditPrompt={setInput}
          onSuggestedAction={handleSuggestedAction}
          onSelectClarificationOption={handleSelectClarificationOption}
          onApproveStep={handleApproveStep}
          onRejectStep={handleRejectStep}
          resolvingStepId={resolvingStepId}
          onSelectStarterPrompt={setInput}
        />
        <CopilotComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={conversation.isThinking || !canExecute}
          disabledReason={!canExecute ? "You don't have permission to run AI actions." : undefined}
          attachments={attachments}
          onAttach={handleAttach}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </div>

      {mode === "power-user" && (
        <CopilotPowerUserDrawer tasks={tasks} hasPlan={!!currentPlan} isRunning={isRunningCurrent} onRun={handleRunPlan} pipelineStages={pipelineStages} />
      )}

      <CopilotContextDrawer open={contextOpen} onClose={() => setContextOpen(false)} context={workspaceContext.context} saving={workspaceContext.saving} onSave={workspaceContext.save} />
    </div>
  );
}
