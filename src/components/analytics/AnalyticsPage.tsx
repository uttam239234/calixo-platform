"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RevenueChart } from "./RevenueChart";
import { TrafficAnalytics } from "./TrafficAnalytics";
import { ChannelPerformance } from "./ChannelPerformance";
import { CampaignPerformance } from "./CampaignPerformance";
import { ConversionFunnel } from "./ConversionFunnel";
import { AudienceInsights } from "./AudienceInsights";
import { GeoPerformance } from "./GeoPerformance";
import { AIInsights } from "./AIInsights";
import { ReportsPanel } from "./ReportsPanel";
import { revenueSeries } from "./mock-data";

export function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");

  const revenueData = useMemo(() => revenueSeries[range], [range]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <AnalyticsHeader selectedRange={range} onRangeChange={setRange} />
      </motion.div>

      <AnalyticsFilters />

      <ExecutiveSummary />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <RevenueChart data={revenueData} range={range} />
        <TrafficAnalytics />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChannelPerformance />
        <CampaignPerformance />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ConversionFunnel />
        <AudienceInsights />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GeoPerformance />
        <AIInsights />
      </div>

      <ReportsPanel />

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
        <Sparkles size={16} className="text-cyan-300" />
        Insights are refreshed every 15 minutes and aligned to your current conversion goals.
        <div className="ml-auto flex items-center gap-2 text-cyan-300">
          <TrendingUp size={16} />
          AI forecast confidence: 91%
        </div>
      </div>
    </div>
  );
}
