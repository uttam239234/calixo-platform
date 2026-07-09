import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}

const toneStyles = {
  cyan: "bg-primary/10 text-primary",
  emerald: "bg-success/10 text-success",
  amber: "bg-warning/10 text-warning",
  rose: "bg-destructive/10 text-destructive",
  slate: "bg-surface text-muted-foreground",
};

export default function IconBadge({ icon: Icon, tone = "slate", className }: IconBadgeProps) {
  return (
    <div className={cn("rounded-xl p-2", toneStyles[tone], className)}>
      <Icon size={16} />
    </div>
  );
}
