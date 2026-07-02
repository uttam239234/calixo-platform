import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: "default" | "accent";
}

export default function ActionButton({ children, tone = "default", className, ...props }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        tone === "accent"
          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
          : "border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
