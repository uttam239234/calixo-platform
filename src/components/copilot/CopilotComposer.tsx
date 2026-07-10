"use client";

import { useRef, type KeyboardEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { CopilotAttachmentChip } from "./CopilotAttachmentChip";
import type { CopilotAttachment } from "./types";

interface CopilotComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  disabledReason?: string;
  attachments: CopilotAttachment[];
  onAttach: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

export function CopilotComposer({ value, onChange, onSend, disabled, disabledReason, attachments, onAttach, onRemoveAttachment }: CopilotComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-border/60 p-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map(a => (
            <CopilotAttachmentChip key={a.id} attachment={a} onRemove={() => onRemoveAttachment(a.id)} />
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-ring/60">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.csv,.xls,.xlsx,.txt"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) onAttach(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach an image, document, spreadsheet, or report"
          aria-label="Attach a file"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={disabled && disabledReason ? disabledReason : "Ask Copilot... e.g., 'My Google Ads performance dropped'"}
          className="scrollbar-thin max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
          }}
        />
        <button type="button" onClick={onSend} disabled={disabled || !value.trim()} className="btn btn-primary btn-icon flex-shrink-0" aria-label="Send message">
          <Send size={15} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">Press Enter to send, Shift+Enter for a new line.</p>
    </div>
  );
}
