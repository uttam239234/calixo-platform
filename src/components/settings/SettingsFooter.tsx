"use client";

import { AlertCircle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsFooterProps {
  changedCount: number;
  onSave: () => void;
  onDiscard: () => void;
}

export function SettingsFooter({ changedCount, onSave, onDiscard }: SettingsFooterProps) {
  if (changedCount === 0) return null;

  return (
    <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-warning/30 bg-warning/5 px-5 py-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-warning">
        <AlertCircle size={13} />
        {changedCount} unsaved change{changedCount === 1 ? "" : "s"}
      </span>
      <div className="flex gap-1.5">
        <Button size="sm" variant="ghost" onClick={onDiscard} className="gap-1.5">
          <X size={13} /> Discard
        </Button>
        <Button size="sm" onClick={onSave} className="gap-1.5">
          <Save size={13} /> Save Changes
        </Button>
      </div>
    </div>
  );
}
