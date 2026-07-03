"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
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

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function AnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");

  const revenueData = useMemo(() => revenueSeries[range], [range]);

  return (
    <div className="space-y-6 pb-8">
      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <AnalyticsHeader selectedRange={range} onRangeChange={setRange} />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <AnalyticsFilters />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <ExecutiveSummary />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <RevenueChart data={revenueData} range={range} />
        <TrafficAnalytics />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChannelPerformance />
        <CampaignPerformance />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ConversionFunnel />
        <AudienceInsights />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GeoPerformance />
        <AIInsights />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <ReportsPanel />
      </motion.div>

      <motion.div variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Sparkles size={16} className="text-primary" />
          Insights are refreshed every 15 minutes and aligned to your current conversion goals.
          <div className="ml-auto flex items-center gap-2 text-primary">
            <TrendingUp size={16} />
            AI forecast confidence: 91%
          </div>
        </div>
      </motion.div>
    </div>
  );
}