import { ReactNode } from "react";

interface SectionBadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: "primary" | "ai" | "light";
}

export function SectionBadge({ icon, children, tone = "primary" }: SectionBadgeProps) {
  const toneClasses = {
    primary: "border-primary/20 bg-primary/10 text-primary",
    ai: "border-[#8B5CF6]/20 bg-[#8B5CF6]/10 text-[#8B5CF6]",
    light: "border-white/15 bg-white/[0.06] text-white/80 backdrop-blur-xl",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold tracking-wide ${toneClasses[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
