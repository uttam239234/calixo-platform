import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}

const toneStyles = {
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  slate: "border-slate-700 bg-slate-800 text-slate-300",
};

export default function StatusBadge({ label, tone = "slate", className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", toneStyles[tone], className)}>
      {label}
    </span>
  );
}
