"use client";

import { useState, useEffect } from "react";
import WelcomeHero from "./WelcomeHero";
import KpiGrid from "./KpiGrid";
import QuickActions from "./QuickActions";
import MarketingPerformanceChart from "./MarketingPerformanceChart";
import ChannelOverview from "./ChannelOverview";
import RecentActivity from "./RecentActivity";
import AiRecommendations from "./AiRecommendations";
import UpcomingTasks from "./UpcomingTasks";
import ConnectedPlatforms from "./ConnectedPlatforms";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function DashboardShell() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Section 1: Hero Section */}
      <motion.div variants={sectionVariants}>
        <WelcomeHero />
      </motion.div>

      {/* Section 2: KPI Cards */}
      <motion.div variants={sectionVariants}>
        <KpiGrid loading={loading} />
      </motion.div>

      {/* Section 3: Marketing Performance Chart */}
      <motion.div variants={sectionVariants}>
        <MarketingPerformanceChart loading={loading} />
      </motion.div>

      {/* Section 4: Channel Overview */}
      <motion.div variants={sectionVariants}>
        <ChannelOverview loading={loading} />
      </motion.div>

      {/* Section 5: Quick Actions */}
      <motion.div variants={sectionVariants}>
        <QuickActions />
      </motion.div>

      {/* Section 6: Two Column - Recent Activity + Upcoming Tasks */}
      <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-2">
        <RecentActivity loading={loading} />
        <UpcomingTasks loading={loading} />
      </motion.div>

      {/* Section 7: Two Column - AI Recommendations + Connected Platforms */}
      <motion.div variants={sectionVariants} className="grid gap-6 lg:grid-cols-2">
        <AiRecommendations loading={loading} />
        <ConnectedPlatforms loading={loading} />
      </motion.div>
    </motion.div>
  );
}