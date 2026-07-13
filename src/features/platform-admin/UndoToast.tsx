"use client";

import { useEffect, useState } from "react";
import { Undo2, X } from "lucide-react";
import { undoPlanChange } from "./commitPlanChange";

interface UndoToastProps {
  token: string;
  message: string;
  windowMs: number;
  onDismiss: () => void;
  onUndo: () => void;
}

/** Shared 5-minute undo surface for the 4 risky action kinds — reused across every section that calls `commitPlanChange` with `risky` set. */
export function UndoToast({ token, message, windowMs, onDismiss, onUndo }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(windowMs / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-2xl">
      <p className="text-sm text-foreground">{message}</p>
      <button
        type="button"
        onClick={() => {
          if (undoPlanChange(token)) onUndo();
          onDismiss();
        }}
        className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <Undo2 size={14} />
        Undo
      </button>
      <span className="text-xs tabular-nums text-muted-foreground">{secondsLeft}s</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
