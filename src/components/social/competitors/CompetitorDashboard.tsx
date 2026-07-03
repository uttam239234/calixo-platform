"use client";
import { motion } from "framer-motion";
import { CompetitorHeader } from "./CompetitorHeader";
import { CompetitorKpiGrid } from "./CompetitorKpiGrid";
import { CompetitorTable } from "./CompetitorTable";
import { CompetitorAddDialog } from "./CompetitorAddDialog";
import { ComparisonEngine } from "./ComparisonEngine";
import { BenchmarkSection } from "./BenchmarkSection";
import { TopContent } from "./TopContent";
import { HashtagIntelligence } from "./HashtagIntelligence";
import { TrendAnalysis } from "./TrendAnalysis";
import { AIInsights } from "./AIInsights";

export function CompetitorDashboard() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <CompetitorHeader />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <CompetitorKpiGrid />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <CompetitorTable />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <ComparisonEngine />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <BenchmarkSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <TopContent />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <HashtagIntelligence />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <TrendAnalysis />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.4 }}
      >
        <AIInsights />
      </motion.div>

      <CompetitorAddDialog />
    </div>
  );
}