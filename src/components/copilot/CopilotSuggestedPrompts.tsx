"use client";

import { cn } from "@/lib/utils";
import { COPILOT_MODULES, SUGGESTED_PROMPTS_BY_MODULE, type CopilotModuleId } from "./constants";

interface CopilotSuggestedPromptsProps {
  currentModule?: string;
  onSelectModule: (moduleId: CopilotModuleId) => void;
  onSelectPrompt: (prompt: string) => void;
}

export function CopilotSuggestedPrompts({ currentModule, onSelectModule, onSelectPrompt }: CopilotSuggestedPromptsProps) {
  const activeModule = (COPILOT_MODULES.find(m => m.id === currentModule)?.id ?? "dashboard") as CopilotModuleId;
  const prompts = SUGGESTED_PROMPTS_BY_MODULE[activeModule];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1">
        {COPILOT_MODULES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectModule(m.id)}
            className={cn(
              "rounded-lg px-2 py-1 text-[10px] font-medium transition-colors",
              activeModule === m.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onSelectPrompt(p)}
            className="rounded-xl border border-border bg-accent/30 px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
