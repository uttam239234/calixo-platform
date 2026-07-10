/**
 * Calixo Platform - Social Module AI Skills
 *
 * Registers Social Media's capabilities into the shared Copilot Skill/Tool
 * registries — no Copilot code is modified, mirrors the Ads registration.
 * This module owns the brief's Social Agent. Real handlers call
 * `SocialPlatformAPI` directly; scheduling/publishing/deleting a post is
 * marked `requiresApproval` (the brief's own named "publish"/"delete"
 * categories).
 */

import { skillRegistry, copilotToolRegistry, clarificationEngine } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { socialPlatformAPI } from "../platform/SocialPlatformAPI";
import { SOCIAL_ORGANIZATION_ID } from "../tenant/SocialTenantDefaults";
import type { SocialPlatform, SocialPost } from "../types";

const AGENT_ID = "social-agent";

const SOCIAL_SKILLS: Skill[] = [
  {
    id: "explain-social-reach",
    name: "Explain Reach",
    description: "Explain total reach across connected social accounts",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["explain-social-reach"],
    triggers: ["explain reach", "how is my reach", "total reach"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-social-engagement",
    name: "Explain Engagement",
    description: "Explain engagement performance across connected accounts",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["explain-social-engagement"],
    triggers: ["engagement declined", "instagram engagement", "explain engagement", "how is engagement"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "explain-social-growth",
    name: "Explain Growth",
    description: "Explain follower growth across connected accounts",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["explain-social-growth"],
    triggers: ["follower growth", "how are followers", "explain growth"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "suggest-posting-time",
    name: "Suggest Posting Time",
    description: "Recommend the best time slot to post next",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["suggest-posting-time"],
    triggers: ["best time to post", "when should i post", "posting time"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "detect-social-fatigue",
    name: "Detect Content Fatigue",
    description: "Flag posts and accounts trailing engagement average",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["detect-social-fatigue"],
    triggers: ["content fatigue", "audience fatigue", "underperforming posts"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "get-social-recommendations",
    name: "Get Social Recommendations",
    description: "Surface optimization recommendations for social accounts",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["get-social-recommendations"],
    triggers: ["social recommendations", "optimize social", "what should i post"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "schedule-social-post",
    name: "Schedule Social Post",
    description: "Schedule a new post on a social platform",
    category: "social",
    engineRef: "SocialPlatformAPI",
    toolIds: ["schedule-social-post"],
    triggers: ["schedule a post", "schedule instagram post", "schedule posts", "create a post", "post to instagram", "post to linkedin", "instagram post", "linkedin post", "schedule an instagram", "schedule a linkedin"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const SOCIAL_TOOLS: PlatformTool[] = [
  { id: "explain-social-reach", name: "Explain Reach", description: "Explain total reach across connected accounts", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "reach-explanation" }], isActive: true },
  { id: "explain-social-engagement", name: "Explain Engagement", description: "Explain engagement performance", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "engagement-explanation" }], isActive: true },
  { id: "explain-social-growth", name: "Explain Growth", description: "Explain follower growth", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "growth-explanation" }], isActive: true },
  { id: "suggest-posting-time", name: "Suggest Posting Time", description: "Recommend the best posting slot", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "posting-time-suggestion" }], isActive: true },
  { id: "detect-social-fatigue", name: "Detect Content Fatigue", description: "Flag underperforming posts/accounts", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "fatigue-detection" }], isActive: true },
  { id: "get-social-recommendations", name: "Get Social Recommendations", description: "Surface optimization recommendations", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "recommendation-lookup" }], isActive: true },
  { id: "schedule-social-post", name: "Schedule Social Post", description: "Schedule a new post", category: "social", provider: "engine", providerRef: "SocialPlatformAPI", capabilities: [{ name: "post-scheduling" }], isActive: true, requiresApproval: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

function fail(error: string) {
  return { success: false as const, error, durationMs: 0 };
}

const SOCIAL_HANDLERS: Record<string, ToolHandler> = {
  "explain-social-reach": async () => ok(socialPlatformAPI.explainReach()),
  "explain-social-engagement": async () => ok(socialPlatformAPI.explainEngagement()),
  "explain-social-growth": async () => ok(socialPlatformAPI.explainGrowth()),
  "suggest-posting-time": async () => ok(socialPlatformAPI.suggestPostingTime()),
  "detect-social-fatigue": async () => {
    const fatigue = [...socialPlatformAPI.detectContentFatigue(), ...socialPlatformAPI.detectAudienceFatigue()];
    return ok(fatigue.length > 0 ? fatigue.join(" ") : "No content or audience fatigue detected right now.");
  },
  "get-social-recommendations": async () => {
    const recs = socialPlatformAPI.recommendActions();
    return ok(recs.length > 0 ? recs.map(r => r.description).join(" ") : "No open social recommendations right now.");
  },
  "schedule-social-post": async input => {
    const platformAnswer = ((input.platform as string) ?? (input.request as string) ?? "Instagram").toLowerCase();
    const knownPlatforms: SocialPlatform[] = ["Facebook", "Instagram", "LinkedIn", "X", "TikTok", "YouTube", "Threads", "Pinterest"];
    const platform = knownPlatforms.find(p => platformAnswer.includes(p.toLowerCase())) ?? "Instagram";
    const account = socialPlatformAPI.listAccounts().find(a => a.platform === platform);
    if (!account) return fail(`No connected ${platform} account to schedule a post on.`);
    const content = (input.content as string) ?? (input.objective as string) ?? (input.request as string) ?? "New post";
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      platform,
      accountId: account.id,
      content: content.slice(0, 280),
      status: "Scheduled",
      publishedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      organizationId: SOCIAL_ORGANIZATION_ID,
    };
    const created = socialPlatformAPI.createPost(post);
    return ok(`Scheduled a post on ${created.platform} for tomorrow: "${created.content.slice(0, 60)}${created.content.length > 60 ? "…" : ""}".`);
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, their real handlers, and the clarification slot profile for post scheduling. */
export function registerSocialSkills(): void {
  if (registered) return;
  for (const tool of SOCIAL_TOOLS) copilotToolRegistry.register(tool, SOCIAL_HANDLERS[tool.id]);
  for (const skill of SOCIAL_SKILLS) skillRegistry.register(skill);

  clarificationEngine.registerSlotProfile("schedule-social-post", [
    { slot: "platform", question: "Which platform should I post to?", options: [{ id: "instagram", label: "Instagram" }, { id: "linkedin", label: "LinkedIn" }, { id: "facebook", label: "Facebook" }, { id: "x", label: "X" }] },
    { slot: "content", question: "What should the post say?" },
  ]);

  registered = true;
}
