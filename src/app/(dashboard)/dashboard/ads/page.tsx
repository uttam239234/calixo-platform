"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdsHeader } from "@/components/ads/AdsHeader";
import { CampaignSummary } from "@/components/ads/CampaignSummary";
import { CampaignTable } from "@/components/ads/CampaignTable";
import { PlatformOverview } from "@/components/ads/PlatformOverview";
import { BudgetOverview } from "@/components/ads/BudgetOverview";
import { PerformanceSnapshot } from "@/components/ads/PerformanceSnapshot";
import { QuickActions } from "@/components/ads/QuickActions";
import { RecommendationPanel } from "@/components/ads/RecommendationPanel";
import { PlatformStatus } from "@/components/ads/PlatformStatus";

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function AdsManagerPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      <motion.div variants={sectionVariants}>
        <AdsHeader />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <QuickActions />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <CampaignSummary loading={loading} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <PlatformOverview />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <CampaignTable />
      </motion.div>

      <motion.div variants={sectionVariants} className="grid gap-6 xl:grid-cols-2">
        <BudgetOverview />
        <PerformanceSnapshot />
      </motion.div>

      <motion.div variants={sectionVariants} className="grid gap-6 xl:grid-cols-2">
        <RecommendationPanel />
        <PlatformStatus />
      </motion.div>
    </motion.div>
  );
}