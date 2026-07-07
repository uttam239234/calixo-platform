/**
 * Calixo Platform - Analytics Module AI Skills
 *
 * Registers the Analytics module's capabilities into the existing
 * Copilot Skill/Tool registries — no Copilot code is modified. Metadata
 * only: no handler is wired and no LLM execution happens here, matching
 * every other module's registration (Settings, Users, Reports, Dashboard).
 *
 * Unlike those modules, `SkillCategory` already has a dedicated
 * "analytics" value — this is the first module to actually use it.
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool } from "@/core/copilot";

const ANALYTICS_SKILLS: Skill[] = [
  {
    id: "summarize-analytics",
    name: "Summarize Analytics",
    description: "Generate an executive summary of current marketing performance",
    category: "analytics",
    engineRef: "AnalyticsEngine",
    toolIds: ["summarize-analytics"],
    triggers: ["summarize analytics", "executive summary", "how is performance"],
    enabled: true,
  },
  {
    id: "explain-trend",
    name: "Explain Trend",
    description: "Explain why a KPI changed compared to the prior period",
    category: "analytics",
    engineRef: "AnalyticsEngine",
    toolIds: ["explain-trend"],
    triggers: ["why did this change", "explain this trend", "what drove this metric"],
    enabled: true,
  },
  {
    id: "compare-periods",
    name: "Compare Time Periods",
    description: "Compare marketing performance across two time periods",
    category: "analytics",
    engineRef: "AnalyticsEngine",
    toolIds: ["compare-periods"],
    triggers: ["compare this month to last month", "compare periods", "how does this week compare"],
    enabled: true,
  },
  {
    id: "identify-underperforming-campaigns",
    name: "Identify Underperforming Campaigns",
    description: "Flag campaigns or channels with declining ROAS or rising CPA",
    category: "analytics",
    engineRef: "AnalyticsEngine",
    toolIds: ["identify-underperforming-campaigns"],
    triggers: ["what's underperforming", "which campaigns are struggling", "identify risks"],
    enabled: true,
  },
  {
    id: "explain-revenue",
    name: "Explain Revenue",
    description: "Explain the revenue trend and what's driving it",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["explain-revenue"],
    triggers: ["explain revenue", "why did revenue change", "how is revenue trending"],
    enabled: true,
  },
  {
    id: "explain-traffic-analytics",
    name: "Explain Traffic",
    description: "Explain the traffic and engagement trend",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["explain-traffic-analytics"],
    triggers: ["explain traffic", "how is traffic trending", "why did sessions change"],
    enabled: true,
  },
  {
    id: "identify-opportunities",
    name: "Identify Opportunities",
    description: "Surface high-confidence growth opportunities",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["identify-opportunities"],
    triggers: ["what opportunities do we have", "where can we grow", "identify opportunities"],
    enabled: true,
  },
  {
    id: "recommend-optimizations",
    name: "Recommend Optimizations",
    description: "Recommend concrete optimizations based on current performance",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["recommend-optimizations"],
    triggers: ["what should we optimize", "recommend improvements", "recommend optimizations"],
    enabled: true,
  },
  {
    id: "generate-executive-report",
    name: "Generate Executive Report",
    description: "Generate a board-ready executive analytics report",
    category: "analytics",
    engineRef: "ReportBuilder",
    toolIds: ["generate-executive-report"],
    triggers: ["generate an executive report", "create a board report", "board summary"],
    enabled: true,
  },
  {
    id: "forecast-analytics-performance",
    name: "Forecast Performance",
    description: "Project revenue forward using a linear trend over the current period",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["forecast-analytics-performance"],
    triggers: ["forecast performance", "project revenue", "what's the revenue trend"],
    enabled: true,
  },
  {
    id: "detect-analytics-anomalies",
    name: "Detect Anomalies",
    description: "Surface rule-based revenue anomalies (day-over-day swings beyond the series average)",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["detect-analytics-anomalies"],
    triggers: ["detect anomalies", "any unusual activity", "flag outliers"],
    enabled: true,
  },
  {
    id: "answer-analytics-question",
    name: "Answer Analytics Question",
    description: "Answer a natural-language question about current analytics data",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["answer-analytics-question"],
    triggers: ["how many", "what was", "show me"],
    enabled: true,
  },
];

const ANALYTICS_TOOLS: PlatformTool[] = [
  {
    id: "summarize-analytics",
    name: "Summarize Analytics",
    description: "Generate an executive summary of current marketing performance",
    category: "analytics",
    provider: "engine",
    providerRef: "AnalyticsEngine",
    capabilities: [{ name: "analytics-summary" }],
    isActive: true,
  },
  {
    id: "explain-trend",
    name: "Explain Trend",
    description: "Explain why a KPI changed compared to the prior period",
    category: "analytics",
    provider: "engine",
    providerRef: "AnalyticsEngine",
    capabilities: [{ name: "trend-explanation" }],
    isActive: true,
  },
  {
    id: "compare-periods",
    name: "Compare Time Periods",
    description: "Compare marketing performance across two time periods",
    category: "analytics",
    provider: "engine",
    providerRef: "AnalyticsEngine",
    capabilities: [{ name: "period-comparison" }],
    isActive: true,
  },
  {
    id: "identify-underperforming-campaigns",
    name: "Identify Underperforming Campaigns",
    description: "Flag campaigns or channels with declining ROAS or rising CPA",
    category: "analytics",
    provider: "engine",
    providerRef: "AnalyticsEngine",
    capabilities: [{ name: "campaign-risk-detection" }],
    isActive: true,
  },
  { id: "explain-revenue", name: "Explain Revenue", description: "Explain the revenue trend and what's driving it", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "revenue-explanation" }], isActive: true },
  { id: "explain-traffic-analytics", name: "Explain Traffic", description: "Explain the traffic and engagement trend", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "traffic-explanation" }], isActive: true },
  { id: "identify-opportunities", name: "Identify Opportunities", description: "Surface high-confidence growth opportunities", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "opportunity-detection" }], isActive: true },
  { id: "recommend-optimizations", name: "Recommend Optimizations", description: "Recommend concrete optimizations based on current performance", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "optimization-recommendation" }], isActive: true },
  { id: "generate-executive-report", name: "Generate Executive Report", description: "Generate a board-ready executive analytics report", category: "analytics", provider: "engine", providerRef: "ReportBuilder", capabilities: [{ name: "report-generation" }], isActive: true },
  { id: "forecast-analytics-performance", name: "Forecast Performance", description: "Project revenue forward using a linear trend", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "revenue-forecast" }], isActive: true },
  { id: "detect-analytics-anomalies", name: "Detect Anomalies", description: "Surface rule-based revenue anomalies", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "anomaly-detection" }], isActive: true },
  { id: "answer-analytics-question", name: "Answer Analytics Question", description: "Answer a natural-language question about current analytics data", category: "analytics", provider: "engine", providerRef: "AnalyticsPlatformAPI", capabilities: [{ name: "nl-query" }], isActive: true },
];

let registered = false;

/** Safe to call more than once. Registers metadata only — no handlers, no LLM execution. */
export function registerAnalyticsSkills(): void {
  if (registered) return;
  for (const tool of ANALYTICS_TOOLS) copilotToolRegistry.register(tool);
  for (const skill of ANALYTICS_SKILLS) skillRegistry.register(skill);
  registered = true;
}
