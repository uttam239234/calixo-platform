"use client";

import { useState, type ComponentType } from "react";
import { Bot, Check, Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopilotMarkdown } from "./CopilotMarkdown";
import type { CopilotMessageView, MessageReaction } from "./types";

interface CopilotMessageBubbleProps {
  message: CopilotMessageView;
  promptContent?: string;
  onRegenerate: (id: string) => void;
  onReact: (id: string, reaction: Exclude<MessageReaction, null>) => void;
  onEditPrompt: (content: string) => void;
  isRegenerating?: boolean;
}

export function CopilotMessageBubble({ message, promptContent, onRegenerate, onReact, onEditPrompt, isRegenerating }: CopilotMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

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
    return (
      <p className="mx-auto max-w-[80%] rounded-2xl bg-accent/50 px-4 py-2 text-center text-xs italic text-muted-foreground">
        {message.content}
      </p>
    );
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
