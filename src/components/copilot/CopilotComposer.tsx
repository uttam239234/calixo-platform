"use client";

import { useRef, type KeyboardEvent } from "react";
import { Mic, Paperclip, Send } from "lucide-react";

interface CopilotComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function CopilotComposer({ value, onChange, onSend, disabled }: CopilotComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-border/60 p-4">
      <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-ring/60">
        <button
          type="button"
          disabled
          title="Attach file (coming soon)"
          aria-label="Attach file (coming soon)"
          className="flex h-9 w-9 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-2xl text-muted-foreground/50"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask the Copilot... e.g., 'Create an Instagram campaign for Q4 launch'"
          className="scrollbar-thin max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
          }}
        />
        <button
          type="button"
          disabled
          title="Voice input (coming soon)"
          aria-label="Voice input (coming soon)"
          className="flex h-9 w-9 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-2xl text-muted-foreground/50"
        >
          <Mic size={16} />
        </button>
        <button type="button" onClick={onSend} disabled={disabled || !value.trim()} className="btn btn-primary btn-icon flex-shrink-0" aria-label="Send message">
          <Send size={15} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">Press Enter to send, Shift+Enter for a new line.</p>
    </div>
  );
}
