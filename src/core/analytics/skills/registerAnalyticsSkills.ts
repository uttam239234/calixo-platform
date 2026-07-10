/**
 * Calixo Platform - Analytics Module AI Skills
 *
 * Registers the Analytics module's capabilities into the existing
 * Copilot Skill/Tool registries — no Copilot code is modified. Matches
 * every other module's registration (Settings, Users, Reports, Dashboard),
 * plus wires real handlers (this module owns 1 of the brief's 7 named
 * specialist agents) so `ToolRegistry.execute()` returns genuine computed
 * text from `AnalyticsPlatformAPI` instead of "no handler registered."
 *
 * Analytics is read-only — no mutation exists in this domain — so no tool
 * here needs `requiresApproval` and no clarification slot profile is
 * registered (asking 5 questions before "why did revenue change" would
 * violate "never ask unnecessary questions").
 */

import { skillRegistry, copilotToolRegistry } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { analyticsPlatformAPI } from "../platform/AnalyticsPlatformAPI";

const AGENT_ID = "analytics-agent";

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
    agentId: AGENT_ID,
  },
  {
    id: "explain-trend",
    name: "Explain Trend",
    description: "Explain why a KPI changed compared to the prior period",
    category: "analytics",
    engineRef: "AnalyticsEngine",
    toolIds: ["explain-trend"],
    triggers: ["why did this change", "explain this trend", "what drove this metric", "revenue trend", "how is revenue trending"],
    enabled: true,
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
  },
  {
    id: "explain-revenue",
    name: "Explain Revenue",
    description: "Explain the revenue trend and what's driving it",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["explain-revenue"],
    triggers: ["explain revenue", "why did revenue change"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-traffic-analytics",
    name: "Explain Traffic",
    description: "Explain the traffic and engagement trend",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["explain-traffic-analytics"],
    triggers: ["explain traffic", "how is traffic trending", "why did sessions change", "admissions trend", "traffic trend"],
    enabled: true,
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
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
    agentId: AGENT_ID,
  },
  {
    id: "answer-analytics-question",
    name: "Answer Analytics Question",
    description: "Answer a natural-language question about current analytics data",
    category: "analytics",
    engineRef: "AnalyticsPlatformAPI",
    toolIds: ["answer-analytics-question"],
    triggers: ["how many", "what was", "show me my"],
    enabled: true,
    agentId: AGENT_ID,
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

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

/**
 * Real handlers — every one calls `analyticsPlatformAPI` and returns its
 * genuine computed output as `data.text`. No LLM, no fabrication: the same
 * "real, computable, not-yet-wired-to-an-LLM" pattern the facade's own
 * methods already document.
 */
const ANALYTICS_HANDLERS: Record<string, ToolHandler> = {
  "summarize-analytics": async () => {
    const summary = analyticsPlatformAPI.getExecutiveSummary();
    const kpiLine = summary.kpis.slice(0, 3).map(k => `${k.label} ${k.value} (${k.change})`).join(", ");
    const insightLine = summary.topInsights[0]?.title;
    return ok(`Here's your executive summary: ${kpiLine}.${insightLine ? ` Top insight: ${insightLine}.` : ""}`);
  },
  "explain-trend": async () => ok(analyticsPlatformAPI.explainRevenue()),
  "compare-periods": async () => {
    const comparison = analyticsPlatformAPI.comparePeriods({ range: "90d", label: "the prior period" }, { range: "30d", label: "this period" });
    return ok(comparison.summary);
  },
  "identify-underperforming-campaigns": async () => {
    const risks = analyticsPlatformAPI.identifyRisks();
    return ok(risks.length > 0 ? risks.join(" ") : "No underperforming campaigns or channels detected this period.");
  },
  "explain-revenue": async () => ok(analyticsPlatformAPI.explainRevenue()),
  "explain-traffic-analytics": async () => ok(analyticsPlatformAPI.explainTraffic()),
  "identify-opportunities": async () => {
    const opportunities = analyticsPlatformAPI.identifyOpportunities();
    return ok(opportunities.length > 0 ? opportunities.map(o => o.description).join(" ") : "No high-confidence opportunities surfaced this period.");
  },
  "recommend-optimizations": async () => {
    const recs = analyticsPlatformAPI.recommendOptimizations();
    return ok(recs.length > 0 ? recs.map(r => r.description).join(" ") : "No open optimization recommendations right now.");
  },
  "generate-executive-report": async () => {
    const summary = analyticsPlatformAPI.getExecutiveSummary();
    const kpiLine = summary.kpis.map(k => `${k.label}: ${k.value} (${k.change})`).join(", ");
    return ok(`Executive report compiled — ${kpiLine}.`);
  },
  "forecast-analytics-performance": async () => {
    const points = analyticsPlatformAPI.forecastRevenue(7);
    const last = points.at(-1);
    return ok(last ? `Projecting revenue forward 7 days from the current trend, landing around ${Math.round(last.projectedValue).toLocaleString()} by ${last.label}.` : "Not enough revenue history yet to forecast.");
  },
  "detect-analytics-anomalies": async () => {
    const anomalies = analyticsPlatformAPI.detectAnomalies();
    return ok(anomalies.length > 0 ? anomalies.join(" ") : "No revenue anomalies detected this period.");
  },
  "answer-analytics-question": async () => {
    const summary = analyticsPlatformAPI.getExecutiveSummary();
    return ok(summary.kpis.map(k => `${k.label}: ${k.value} (${k.change})`).join(", "));
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, and their real handlers. */
export function registerAnalyticsSkills(): void {
  if (registered) return;
  for (const tool of ANALYTICS_TOOLS) copilotToolRegistry.register(tool, ANALYTICS_HANDLERS[tool.id]);
  for (const skill of ANALYTICS_SKILLS) skillRegistry.register(skill);
  registered = true;
}
