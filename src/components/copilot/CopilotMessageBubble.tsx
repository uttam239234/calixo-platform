"use client";

import { useState, type ComponentType } from "react";
import { Bot, Check, Copy, Loader2, Pencil, RefreshCw, ShieldAlert, ThumbsDown, ThumbsUp, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentRegistry, suggestedActionsFor } from "@/core/copilot";
import type { ClarificationOption, ExecutionStep } from "@/core/copilot";
import { CopilotMarkdown } from "./CopilotMarkdown";
import { CopilotAttachmentChip } from "./CopilotAttachmentChip";
import type { CopilotMessageView, MessageReaction } from "./types";

interface CopilotMessageBubbleProps {
  message: CopilotMessageView;
  promptContent?: string;
  onRegenerate: (id: string) => void;
  onReact: (id: string, reaction: Exclude<MessageReaction, null>) => void;
  onEditPrompt: (content: string) => void;
  isRegenerating?: boolean;
  onSuggestedAction: (label: string) => void;
  onSelectClarificationOption: (option: ClarificationOption) => void;
  onApproveStep: (messageId: string, step: ExecutionStep) => void;
  onRejectStep: (messageId: string, step: ExecutionStep) => void;
  resolvingStepId?: string | null;
}

interface CopilotMessageMetadata {
  agentId?: string;
  citation?: string;
  clarificationOptions?: ClarificationOption[];
}

export function CopilotMessageBubble({
  message,
  promptContent,
  onRegenerate,
  onReact,
  onEditPrompt,
  isRegenerating,
  onSuggestedAction,
  onSelectClarificationOption,
  onApproveStep,
  onRejectStep,
  resolvingStepId,
}: CopilotMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const meta = message.metadata as CopilotMessageMetadata | undefined;
  const agent = meta?.agentId ? agentRegistry.lookup(meta.agentId) : undefined;
  const showSuggestedActions = !isUser && !meta?.clarificationOptions?.length && !(message.pendingApprovalSteps && message.pendingApprovalSteps.length > 0);
  const suggestedActions = showSuggestedActions ? suggestedActionsFor(meta?.agentId) : [];

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(message.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  if (isSystem) {
    return <p className="mx-auto max-w-[80%] rounded-2xl bg-accent/50 px-4 py-2 text-center text-xs italic text-muted-foreground">{message.content}</p>;
  }

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary/10 text-primary" : "bg-gradient-to-br from-primary to-ai text-white"
        )}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div className={cn("min-w-0 max-w-[75%] space-y-1.5", isUser && "flex flex-col items-end")}>
        <div className={cn("px-4 py-3", isUser ? "rounded-3xl bg-primary text-primary-foreground" : "card")}>
          {isUser ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p> : <CopilotMarkdown content={message.content} />}
        </div>

        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map(a => (
              <CopilotAttachmentChip key={a.id} attachment={a} />
            ))}
          </div>
        )}

        {!isUser && (agent || meta?.citation) && (
          <p className="px-1 text-[11px] text-muted-foreground">
            {agent ? `Answered by the ${agent.name}` : null}
            {agent && meta?.citation ? " · " : null}
            {meta?.citation}
          </p>
        )}

        {!isUser && meta?.clarificationOptions && meta.clarificationOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.clarificationOptions.map(option => (
              <button
                key={option.id}
                onClick={() => onSelectClarificationOption(option)}
                className="rounded-xl border border-border bg-accent/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {!isUser && message.pendingApprovalSteps && message.pendingApprovalSteps.length > 0 && (
          <div className="w-full space-y-2 rounded-2xl border border-warning/30 bg-warning/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-warning">
              <ShieldAlert size={13} /> Needs your approval
            </div>
            {message.pendingApprovalSteps.map(step => {
              const resolving = resolvingStepId === step.id;
              return (
                <div key={step.id} className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{step.label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => onApproveStep(message.id, step)}
                      disabled={resolving}
                      className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                      {resolving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Approve
                    </button>
                    <button
                      onClick={() => onRejectStep(message.id, step)}
                      disabled={resolving}
                      className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-accent disabled:opacity-60"
                    >
                      <X size={11} /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedActions.map(action => (
              <button
                key={action.id}
                onClick={() => onSuggestedAction(action.label)}
                className="rounded-xl border border-border bg-accent/30 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className={cn("flex items-center gap-1", isUser && "flex-row-reverse")}>
          <ActionIcon icon={copied ? Check : Copy} label="Copy" onClick={handleCopy} active={copied} />
          {!isUser && (
            <>
              <ActionIcon icon={RefreshCw} label="Regenerate" onClick={() => onRegenerate(message.id)} spinning={isRegenerating} />
              <ActionIcon icon={ThumbsUp} label="Like" onClick={() => onReact(message.id, "like")} active={message.reaction === "like"} />
              <ActionIcon icon={ThumbsDown} label="Dislike" onClick={() => onReact(message.id, "dislike")} active={message.reaction === "dislike"} />
              {promptContent && <ActionIcon icon={Pencil} label="Edit Prompt" onClick={() => onEditPrompt(promptContent)} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionIcon({
  icon: Icon,
  label,
  onClick,
  active,
  spinning,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  spinning?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground/60 hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon size={12.5} className={cn(spinning && "animate-spin")} />
    </button>
  );
}
