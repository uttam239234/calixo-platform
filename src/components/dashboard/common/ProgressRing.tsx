import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  tone?: "cyan" | "emerald" | "amber" | "rose";
  className?: string;
}

const toneClasses = {
  cyan: "stroke-cyan-400",
  emerald: "stroke-emerald-400",
  amber: "stroke-amber-400",
  rose: "stroke-rose-400",
};

export default function ProgressRing({
  value,
  size = 84,
  strokeWidth = 8,
  label,
  tone = "cyan",
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(148,163,184,0.2)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className={toneClasses[tone]}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-semibold text-white">{value}%</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}
