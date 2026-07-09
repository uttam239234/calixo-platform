"use client";

import { Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardWidgetKey } from "@/core/dashboard";

export interface NudgeSuggestion {
  widgetKey: DashboardWidgetKey;
  widgetLabel: string;
  reason: string;
}

interface PersonalizationNudgeProps {
  suggestion: NudgeSuggestion | null;
  onPin: (key: DashboardWidgetKey) => void;
  onDismiss: () => void;
}

/** A single, real, session-scoped nudge derived from actual Commercial-Platform usage totals (see `DashboardShell`'s `nudgeSuggestion` memo) — not a fabricated recommendation. */
export default function PersonalizationNudge({ suggestion, onPin, onDismiss }: PersonalizationNudgeProps) {
  if (!suggestion) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
      <div className="flex min-w-0 items-center gap-2 text-foreground">
        <Pin size={14} className="flex-shrink-0 text-primary" />
        <span className="truncate">
          {suggestion.reason} Pin <strong>{suggestion.widgetLabel}</strong> to keep it handy?
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Button size="sm" onClick={() => onPin(suggestion.widgetKey)}>
          Pin it
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Dismiss suggestion" onClick={onDismiss}>
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
