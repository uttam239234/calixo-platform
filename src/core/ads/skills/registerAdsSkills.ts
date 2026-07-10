/**
 * Calixo Platform - Ads Module AI Skills
 *
 * Registers Ads Manager's capabilities into the shared Copilot Skill/Tool
 * registries — no Copilot code is modified, mirrors Analytics/Reports'
 * registration. This module owns the brief's Advertising Agent. Real
 * handlers call `AdsPlatformAPI` directly; pause/budget-change tools are
 * marked `requiresApproval` (the brief's own named "pause campaigns" and
 * "budget changes" categories) so Copilot holds them for explicit
 * confirmation instead of auto-running a live campaign mutation.
 *
 * Registers a clarification slot profile matching the brief's own worked
 * example almost exactly ("I want admissions leads" -> program, geography,
 * budget, channels, audience) for the one skill that creates a new
 * campaign — every read-only explain/analyze skill asks nothing.
 */

import { skillRegistry, copilotToolRegistry, clarificationEngine } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { adsPlatformAPI } from "../platform/AdsPlatformAPI";
import { ADS_ORGANIZATION_ID, ADS_CURRENT_USER_ID } from "../tenant/AdsTenantDefaults";
import type { Campaign } from "../types";

const AGENT_ID = "advertising-agent";

const ADS_SKILLS: Skill[] = [
  {
    id: "explain-ad-performance",
    name: "Explain Ad Performance",
    description: "Explain spend, ROAS, and CPA across running campaigns",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["explain-ad-performance"],
    triggers: ["ad performance", "how are my ads", "google ads performance", "campaign performance", "how is spend"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-ad-roas",
    name: "Explain ROAS",
    description: "Explain return on ad spend across running campaigns",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["explain-ad-roas"],
    triggers: ["roas", "return on ad spend"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-ad-cpa",
    name: "Explain CPA",
    description: "Explain cost per acquisition across running campaigns",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["explain-ad-cpa"],
    triggers: ["cpa", "cost per acquisition", "cost per conversion", "cost per lead"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "identify-ad-budget-risks",
    name: "Identify Budget Risks",
    description: "Flag campaigns close to or past their budget cap",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["identify-ad-budget-risks"],
    triggers: ["budget risk", "running out of budget", "over budget", "budget pacing"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "detect-ad-creative-fatigue",
    name: "Detect Creative Fatigue",
    description: "Flag running campaigns with a low creative quality score",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["detect-ad-creative-fatigue"],
    triggers: ["creative fatigue", "refresh creative", "ad creative"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "get-ad-recommendations",
    name: "Get Ad Recommendations",
    description: "Surface optimization recommendations for running campaigns",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["get-ad-recommendations"],
    triggers: ["optimize ads", "ad recommendations", "what should i do with my ads", "optimize my campaign"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "forecast-ad-spend",
    name: "Forecast Ad Spend",
    description: "Project ad spend forward using a linear trend",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["forecast-ad-spend"],
    triggers: ["forecast spend", "project ad spend", "spend trend"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "plan-ad-campaign",
    name: "Plan Ad Campaign",
    description: "Create a new ad campaign from a plain-language goal",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["plan-ad-campaign"],
    triggers: ["create a campaign", "create a google ads campaign", "create a meta campaign", "new campaign", "i want leads", "i want more leads", "admissions leads"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "pause-ad-campaign",
    name: "Pause Ad Campaign",
    description: "Pause the highest-spend running campaign, or a named one",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["pause-ad-campaign"],
    triggers: ["pause campaign", "pause my campaign", "stop this campaign", "pause ads"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "change-ad-budget",
    name: "Change Campaign Budget",
    description: "Update the budget on the highest-spend running campaign",
    category: "advertising",
    engineRef: "AdsPlatformAPI",
    toolIds: ["change-ad-budget"],
    triggers: ["change budget", "increase budget", "lower budget", "update campaign budget"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const ADS_TOOLS: PlatformTool[] = [
  { id: "explain-ad-performance", name: "Explain Ad Performance", description: "Explain spend, ROAS, and CPA across running campaigns", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "performance-explanation" }], isActive: true },
  { id: "explain-ad-roas", name: "Explain ROAS", description: "Explain return on ad spend", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "roas-explanation" }], isActive: true },
  { id: "explain-ad-cpa", name: "Explain CPA", description: "Explain cost per acquisition", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "cpa-explanation" }], isActive: true },
  { id: "identify-ad-budget-risks", name: "Identify Budget Risks", description: "Flag campaigns close to their budget cap", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "budget-risk-detection" }], isActive: true },
  { id: "detect-ad-creative-fatigue", name: "Detect Creative Fatigue", description: "Flag low creative-quality campaigns", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "creative-fatigue-detection" }], isActive: true },
  { id: "get-ad-recommendations", name: "Get Ad Recommendations", description: "Surface optimization recommendations", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "recommendation-lookup" }], isActive: true },
  { id: "forecast-ad-spend", name: "Forecast Ad Spend", description: "Project ad spend forward", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "spend-forecast" }], isActive: true },
  { id: "plan-ad-campaign", name: "Plan Ad Campaign", description: "Create a new ad campaign", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "campaign-creation" }], isActive: true },
  { id: "pause-ad-campaign", name: "Pause Ad Campaign", description: "Pause a running campaign", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "campaign-pause" }], isActive: true, requiresApproval: true },
  { id: "change-ad-budget", name: "Change Campaign Budget", description: "Update a campaign's budget", category: "advertising", provider: "engine", providerRef: "AdsPlatformAPI", capabilities: [{ name: "budget-change" }], isActive: true, requiresApproval: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

function fail(error: string) {
  return { success: false as const, error, durationMs: 0 };
}

function topRunningCampaign(): Campaign | undefined {
  return [...adsPlatformAPI.listCampaigns()].filter(c => c.status === "Running").sort((a, b) => b.spend - a.spend)[0];
}

function extractDollarAmount(text2: string): number | undefined {
  const match = text2.replace(/,/g, "").match(/\$?(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

const ADS_HANDLERS: Record<string, ToolHandler> = {
  "explain-ad-performance": async () => ok(`${adsPlatformAPI.explainSpend()} ${adsPlatformAPI.explainRoas()}`),
  "explain-ad-roas": async () => ok(adsPlatformAPI.explainRoas()),
  "explain-ad-cpa": async () => ok(adsPlatformAPI.explainCpa()),
  "identify-ad-budget-risks": async () => {
    const risks = adsPlatformAPI.identifyBudgetRisks();
    return ok(risks.length > 0 ? risks.join(" ") : "No campaigns are close to their budget cap right now.");
  },
  "detect-ad-creative-fatigue": async () => {
    const fatigue = adsPlatformAPI.detectCreativeFatigue();
    return ok(fatigue.length > 0 ? fatigue.join(" ") : "No running campaigns show creative fatigue right now.");
  },
  "get-ad-recommendations": async () => {
    const recs = adsPlatformAPI.getRecommendations().filter(r => r.status === "new");
    return ok(recs.length > 0 ? recs.map(r => r.description).join(" ") : "No open ad recommendations right now.");
  },
  "forecast-ad-spend": async () => {
    const points = adsPlatformAPI.forecastSpend(7);
    const last = points.at(-1);
    return ok(last ? `Projecting spend forward 7 days, landing around $${Math.round(last.projectedValue).toLocaleString()} by ${last.label}.` : "Not enough campaign history yet to forecast spend.");
  },
  "plan-ad-campaign": async input => {
    const objective = (input.objective as string) ?? (input.request as string) ?? "Growth campaign";
    const budgetAnswer = (input.budget as string) ?? "";
    const budget = extractDollarAmount(budgetAnswer) ?? extractDollarAmount((input.request as string) ?? "") ?? 1000;
    const channelAnswer = ((input.channels as string) ?? "google").toLowerCase();
    const platformId = (["google", "meta", "linkedin"] as const).find(p => channelAnswer.includes(p)) ?? "google";
    const audience = (input.audience as string) ?? "General audience";
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: `camp-${Date.now()}`,
      platformId,
      name: objective.slice(0, 60),
      objective,
      budget,
      spend: 0,
      status: "Draft",
      conversions: 0,
      ctr: 0,
      roas: 0,
      revenue: 0,
      clicks: 0,
      impressions: 0,
      cpa: 0,
      qualityScore: 7,
      owner: ADS_CURRENT_USER_ID,
      createdAt: now,
      startDate: now,
      endDate: now,
      audience,
      keywords: [],
      creatives: 0,
      organizationId: ADS_ORGANIZATION_ID,
    };
    const created = adsPlatformAPI.createCampaign(campaign);
    return ok(`Drafted a new campaign "${created.name}" on ${created.platformId} with a $${created.budget.toLocaleString()} budget, targeting ${created.audience} — saved as a draft, ready for you to review before it goes live.`);
  },
  "pause-ad-campaign": async input => {
    const name = input.campaignName as string | undefined;
    const target = name ? adsPlatformAPI.listCampaigns().find(c => c.name.toLowerCase().includes(name.toLowerCase())) : topRunningCampaign();
    if (!target) return fail("I couldn't find a running campaign to pause.");
    adsPlatformAPI.applyCampaignAction([target.id], "Pause");
    return ok(`Paused "${target.name}".`);
  },
  "change-ad-budget": async input => {
    const target = topRunningCampaign();
    if (!target) return fail("I couldn't find a running campaign to update.");
    const amount = extractDollarAmount((input.request as string) ?? "");
    if (!amount) return fail("Let me know the new budget amount, e.g. \"change the budget to $5,000\".");
    adsPlatformAPI.updateCampaign(target.id, { budget: amount });
    return ok(`Updated "${target.name}"'s budget to $${amount.toLocaleString()}.`);
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, their real handlers, and the clarification slot profile for campaign creation. */
export function registerAdsSkills(): void {
  if (registered) return;
  for (const tool of ADS_TOOLS) copilotToolRegistry.register(tool, ADS_HANDLERS[tool.id]);
  for (const skill of ADS_SKILLS) skillRegistry.register(skill);

  clarificationEngine.registerSlotProfile("plan-ad-campaign", [
    { slot: "objective", question: "What's this campaign for?", options: [{ id: "leads", label: "Generating leads" }, { id: "awareness", label: "Brand awareness" }, { id: "sales", label: "Driving sales" }] },
    { slot: "geography", question: "Which geography should it target?" },
    { slot: "budget", question: "What's your budget range?", extract: t => (t.match(/\$?\d[\d,]*/) ? t.match(/\$?\d[\d,]*/)![0] : undefined) },
    { slot: "channels", question: "Which channels — Google, Meta, or LinkedIn?", options: [{ id: "google", label: "Google" }, { id: "meta", label: "Meta" }, { id: "linkedin", label: "LinkedIn" }] },
    { slot: "audience", question: "Who's the target audience?" },
  ]);

  registered = true;
}
