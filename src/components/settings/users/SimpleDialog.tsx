"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

interface SimpleDialogProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

/** No dedicated Modal primitive exists in `src/components/ui/` — a small centered overlay, same "don't invent new UI primitives mid-phase" call as the earlier Users & Teams round. */
export function SimpleDialog({ title, description, onClose, children }: SimpleDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <button onClick={onClose} className="flex-shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
