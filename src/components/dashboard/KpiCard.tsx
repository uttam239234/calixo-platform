import type { LucideIcon } from "lucide-react";
import MetricSparkline from "./common/MetricSparkline";
import IconBadge from "./common/IconBadge";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "steady";
  sparkline: number[];
  comparison: string;
  tone?: "cyan" | "emerald" | "amber" | "rose";
}

const toneStyles = {
  cyan: "text-cyan-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  sparkline,
  comparison,
  tone = "cyan",
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_20px_45px_rgba(2,8,23,0.35)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <IconBadge icon={Icon} tone={tone} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className={`font-medium ${toneStyles[tone]}`}>{change}</span>
        <span className="text-slate-500">{trend === "up" ? "▲" : "•"}</span>
      </div>

      <MetricSparkline values={sparkline} />
      <p className="mt-2 text-sm text-slate-500">{comparison}</p>
    </div>
  );
}
