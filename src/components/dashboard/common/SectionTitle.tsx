import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionTitle({ title, subtitle, action, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
