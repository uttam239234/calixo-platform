"use client";

import { X } from "lucide-react";
import { CopilotContextPanel } from "./CopilotContextPanel";
import type { WorkspaceContext } from "@/core/copilot";

interface CopilotContextDrawerProps {
  open: boolean;
  onClose: () => void;
  context: WorkspaceContext;
  saving: boolean;
  onSave: (patch: Partial<WorkspaceContext>) => void;
}

/**
 * The brief's "Context Panel" — one of only 5 elements the screen may show — rendered as a
 * header-triggered, closed-by-default drawer instead of a permanent 300px rail, satisfying
 * "no side panels by default" while keeping it available on demand.
 */
export function CopilotContextDrawer({ open, onClose, context, saving, onSave }: CopilotContextDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-background/40" onClick={onClose}>
      <div className="scrollbar-thin h-full w-[320px] flex-shrink-0 overflow-y-auto border-l border-border bg-card p-4" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Context</h2>
            <p className="text-xs text-muted-foreground">What Copilot remembers about this conversation</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close context panel">
            <X size={16} />
          </button>
        </div>
        <CopilotContextPanel context={context} saving={saving} onSave={onSave} />
      </div>
    </div>
  );
}
