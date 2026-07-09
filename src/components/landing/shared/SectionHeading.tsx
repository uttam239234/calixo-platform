import { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SectionBadge } from "./SectionBadge";

interface SectionHeadingProps {
  badge?: ReactNode;
  badgeIcon?: ReactNode;
  badgeTone?: "primary" | "ai" | "light";
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  size?: "md" | "lg";
  light?: boolean;
}

export function SectionHeading({
  badge,
  badgeIcon,
  badgeTone = "primary",
  title,
  subtitle,
  align = "center",
  size = "lg",
  light = false,
}: SectionHeadingProps) {
  const alignClasses = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const titleSize = size === "lg" ? "text-[32px] leading-[1.15] md:text-[44px] md:leading-[1.1]" : "text-[26px] leading-tight md:text-[32px]";

  return (
    <div className={`flex flex-col gap-5 ${alignClasses} max-w-3xl`}>
      {badge && (
        <Reveal>
          <SectionBadge icon={badgeIcon} tone={badgeTone}>
            {badge}
          </SectionBadge>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className={`font-bold tracking-tight ${titleSize} ${light ? "text-white" : "text-foreground"}`}>{title}</h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.14}>
          <p className={`text-[17px] leading-relaxed ${light ? "text-white/65" : "text-muted-foreground"}`}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
