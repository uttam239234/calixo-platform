"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

/** A simple on/off switch — the "6 simple toggles" surface the Settings brief asks for, never a checkbox. */
export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-border",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className={cn("inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}
