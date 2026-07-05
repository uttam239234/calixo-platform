"use client";

import { Bot, Cast, Users } from "lucide-react";
import type { Session } from "@/core/copilot";
import { DEMO_WORKSPACE_NAME } from "./constants";

interface CopilotChatHeaderProps {
  session: Session | null;
  model: string;
}

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function CopilotChatHeader({ session, model }: CopilotChatHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-border/60 px-5 py-3.5">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold text-foreground">{session?.title ?? "New Conversation"}</h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span>{DEMO_WORKSPACE_NAME}</span>
          <span className="flex items-center gap-1">
            <Bot size={11} className="text-ai" /> {model}
          </span>
          <span>Updated {formatUpdated(session?.updatedAt)}</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled
          title="Screen share (coming soon)"
          aria-label="Screen share (coming soon)"
          className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-xl text-muted-foreground/50"
        >
          <Cast size={15} />
        </button>
        <button
          type="button"
          disabled
          title="Live collaboration (coming soon)"
          aria-label="Live collaboration (coming soon)"
          className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-xl text-muted-foreground/50"
        >
          <Users size={15} />
        </button>
      </div>
    </div>
  );
}
