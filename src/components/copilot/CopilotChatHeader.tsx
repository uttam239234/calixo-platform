"use client";

import { Bot, PanelRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/core/copilot";
import type { CopilotMode } from "@/features/copilot/CopilotProvider";

interface CopilotChatHeaderProps {
  session: Session | null;
  model: string;
  mode: CopilotMode;
  onToggleMode: () => void;
  onOpenContext: () => void;
  onOpenSearch: () => void;
}

function formatUpdated(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function CopilotChatHeader({ session, model, mode, onToggleMode, onOpenContext, onOpenSearch }: CopilotChatHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-border/60 px-5 py-3.5">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold text-foreground">{session?.title ?? "New Conversation"}</h1>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bot size={11} className="text-ai" /> {model}
          </span>
          <span>Updated {formatUpdated(session?.updatedAt)}</span>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenSearch}
          title="Search (⌘K)"
          aria-label="Search"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Search size={15} />
        </button>
        <button
          type="button"
          onClick={onOpenContext}
          title="Context"
          aria-label="Open context panel"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <PanelRight size={15} />
        </button>
        <button
          type="button"
          onClick={onToggleMode}
          title={mode === "power-user" ? "Switch to Beginner mode" : "Switch to Power User mode"}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors",
            mode === "power-user" ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Sparkles size={12} />
          {mode === "power-user" ? "Power User" : "Beginner"}
        </button>
      </div>
    </div>
  );
}
