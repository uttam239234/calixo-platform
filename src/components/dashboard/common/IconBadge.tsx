import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}

const toneStyles = {
  cyan: "bg-cyan-500/10 text-cyan-300",
  emerald: "bg-emerald-500/10 text-emerald-300",
  amber: "bg-amber-500/10 text-amber-300",
  rose: "bg-rose-500/10 text-rose-300",
  slate: "bg-slate-800 text-slate-300",
};

export default function IconBadge({ icon: Icon, tone = "slate", className }: IconBadgeProps) {
  return (
    <div className={cn("rounded-xl p-2", toneStyles[tone], className)}>
      <Icon size={16} />
    </div>
  );
}
