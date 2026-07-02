"use client";

import { motion } from "framer-motion";
import WelcomeBanner from "./WelcomeBanner";
import HealthScore from "./HealthScore";
import KpiGrid from "./KpiGrid";
import AiRecommendations from "./AiRecommendations";
import QuickActions from "./QuickActions";
import ConnectedAccounts from "./ConnectedAccounts";
import RecentActivity from "./RecentActivity";
import MarketingPerformanceChart from "./MarketingPerformanceChart";
import CalendarWidget from "./CalendarWidget";

export default function DashboardShell() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <WelcomeBanner />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.2fr_0.8fr]">
        <HealthScore />
        <QuickActions />
      </div>

      <KpiGrid />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <MarketingPerformanceChart />
        <div className="space-y-6">
          <AiRecommendations />
          <CalendarWidget />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ConnectedAccounts />
        <RecentActivity />
      </div>
    </div>
  );
}
