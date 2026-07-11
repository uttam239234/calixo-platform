"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

/** A generic hover/focus tooltip wrapper — accessible by construction (Radix manages focus/hover/escape/ARIA). */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 max-w-xs rounded-xl border border-border bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-lg",
              "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-card" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

/** The brief's mandatory "What does this do?" explainer — a small inline (?) affordance next to any setting label. */
export function WhatDoesThisDo({ children }: { children: ReactNode }) {
  return (
    <Tooltip content={children}>
      <button type="button" aria-label="What does this do?" className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground">
        <HelpCircle size={13} />
      </button>
    </Tooltip>
  );
}
