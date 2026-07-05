"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useCopilotSessions } from "@/hooks/useCopilotSessions";
import { useCopilotConversation } from "@/hooks/useCopilotConversation";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useCopilotExecution } from "@/hooks/useCopilotExecution";
import {
  CopilotSidebar,
  CopilotChatHeader,
  CopilotMessageList,
  CopilotComposer,
  CopilotContextPanel,
  CopilotExecutionPanel,
  CopilotPlanPipeline,
  CopilotSuggestedPrompts,
  buildPipelineStages,
  type CopilotModuleId,
} from "@/components/copilot";
import { initializeCopilotFoundation } from "@/core/copilot";
import { DEFAULT_MODEL_CONFIG } from "@/aios/types";

// Registers the built-in Skills and Tools once per browser session. Safe
// to call repeatedly — the foundation guards against double-registration.
initializeCopilotFoundation();

export default function CopilotPage() {
  const sessions = useCopilotSessions();
  const conversation = useCopilotConversation(sessions.currentSessionId, sessions.currentSession?.conversationId ?? null);
  const workspaceContext = useWorkspaceContext(sessions.currentSessionId);
  const execution = useCopilotExecution();

  const [input, setInput] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const lastResult = conversation.lastResult;
  const currentPlan = lastResult && lastResult.clarificationsNeeded.length === 0 ? lastResult.plan : undefined;
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

  const handleSend = useCallback(async () => {
    const text = input;
    if (!text.trim()) return;
    setInput("");
    await conversation.sendMessage(text);
    await workspaceContext.pushRecentChat(text.slice(0, 60));
  }, [input, conversation, workspaceContext]);

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      setRegeneratingId(messageId);
      try {
        await conversation.regenerate(messageId);
      } finally {
        setRegeneratingId(null);
      }
    },
    [conversation]
  );

  const handleRunPlan = useCallback(() => {
    if (currentPlan) execution.runPlan(currentPlan);
  }, [currentPlan, execution]);

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
        <CopilotChatHeader session={sessions.currentSession} model={DEFAULT_MODEL_CONFIG.model} />
        <CopilotMessageList
          messages={conversation.messages}
          isThinking={conversation.isThinking}
          regeneratingId={regeneratingId}
          onRegenerate={handleRegenerate}
          onReact={conversation.setReaction}
          onEditPrompt={setInput}
        />
        <CopilotComposer value={input} onChange={setInput} onSend={handleSend} disabled={conversation.isThinking} />
      </div>

      <div className="scrollbar-thin w-[300px] flex-shrink-0 space-y-4 overflow-y-auto pb-2 pr-0.5">
        <Card>
          <CardHeader title="Workspace Context" description="Read & saved via MemoryEngine" />
          <CardContent>
            <CopilotContextPanel context={workspaceContext.context} saving={workspaceContext.saving} onSave={workspaceContext.save} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Execution" description="Live task states from ExecutionEngine" />
          <CardContent>
            <CopilotExecutionPanel tasks={tasks} hasPlan={!!currentPlan} isRunning={isRunningCurrent} onRun={handleRunPlan} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Execution Plan" description="Planner pipeline" />
          <CardContent>
            <CopilotPlanPipeline stages={pipelineStages} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Suggested Prompts" description="Context-aware by module" />
          <CardContent>
            <CopilotSuggestedPrompts
              currentModule={workspaceContext.context.currentModule}
              onSelectModule={(id: CopilotModuleId) => workspaceContext.setCurrentModule(id)}
              onSelectPrompt={setInput}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
