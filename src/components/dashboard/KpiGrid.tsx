import { ArrowUpRight, BarChart3, CircleDollarSign, Sparkles, Users } from "lucide-react";
import KpiCard from "./KpiCard";
import { kpiData } from "./mock-data";

const iconMap = {
  Revenue: CircleDollarSign,
  "Qualified Leads": Users,
  Automation: Sparkles,
  Conversion: ArrowUpRight,
  Retention: BarChart3,
  Engagement: Sparkles,
  "Response Time": ArrowUpRight,
  Attribution: BarChart3,
};

export default function KpiGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpiData.map((item) => {
        const Icon = iconMap[item.title as keyof typeof iconMap] ?? ArrowUpRight;
        const tone = item.trend === "up" ? "cyan" : "amber";

        return (
          <KpiCard
            key={item.id}
            title={item.title}
            value={item.value}
            change={item.change}
            icon={Icon}
            trend={item.trend}
            sparkline={item.sparkline}
            comparison={item.comparison}
            tone={tone}
          />
        );
      })}
    </div>
  );
}
