/**
 * Calixo Platform - Content Studio Module AI Skills
 *
 * Registers Content Studio's capabilities into the shared Copilot
 * Skill/Tool registries — no Copilot code is modified. This module owns
 * the brief's Content Agent, and folds in asset search/save since Assets
 * isn't one of the 7 named agents. Real handlers call `ContentPlatformAPI`/
 * `AssetsPlatformAPI` directly — never the underlying generation engines
 * (this is deliberately a thin call-through to the already-thin
 * orchestration layer Content Studio itself built).
 *
 * Generation produces a draft only (nothing is published/live), so none
 * of these tools require approval — matches Content Studio's own
 * established pattern where "Submit for Approval"/"Schedule on Social"
 * are the actual gated publish step, owned by Workflow/Social respectively.
 */

import { skillRegistry, copilotToolRegistry, clarificationEngine } from "@/core/copilot";
import type { Skill, PlatformTool, ToolHandler } from "@/core/copilot";
import { contentPlatformAPI } from "../platform/ContentPlatformAPI";
import { CONTENT_ORGANIZATION_ID } from "../tenant/ContentTenantDefaults";
import { assetsPlatformAPI } from "@/core/assets";
import type { ContentBrief, ContentOutputKind } from "../types";
import type { ToneOption } from "@/core/ai/types";

const AGENT_ID = "content-agent";
const KNOWN_TONES: ToneOption[] = ["professional", "conversational", "persuasive", "authoritative", "friendly", "witty", "empathetic", "formal"];

const CONTENT_SKILLS: Skill[] = [
  {
    id: "generate-written-content",
    name: "Generate Content",
    description: "Create marketing content, articles, and copy",
    category: "content",
    engineRef: "ContentPlatformAPI",
    toolIds: ["generate-written-content"],
    triggers: ["write", "create content", "linkedin content", "create linkedin content", "blog post", "write copy", "generate content"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "improve-written-content",
    name: "Improve Content",
    description: "Rewrite, shorten, expand, or improve existing generated content",
    category: "content",
    engineRef: "ContentPlatformAPI",
    toolIds: ["improve-written-content"],
    triggers: ["rewrite", "shorten this", "expand this", "improve readability", "improve seo", "make it shorter", "make it longer"],
    enabled: true,
    agentId: AGENT_ID,
  },
  {
    id: "search-assets",
    name: "Search Assets",
    description: "Search saved content and creative assets",
    category: "asset",
    engineRef: "AssetsPlatformAPI",
    toolIds: ["search-assets"],
    triggers: ["find asset", "search assets", "library", "find my content"],
    enabled: true,
    agentId: AGENT_ID,
  },
];

const CONTENT_TOOLS: PlatformTool[] = [
  { id: "generate-written-content", name: "Generate Content", description: "Create marketing content, articles, and copy", category: "content", provider: "engine", providerRef: "ContentPlatformAPI", capabilities: [{ name: "text-generation" }], isActive: true },
  { id: "improve-written-content", name: "Improve Content", description: "Rewrite/shorten/expand/improve generated content", category: "content", provider: "engine", providerRef: "ContentPlatformAPI", capabilities: [{ name: "text-refinement" }], isActive: true },
  { id: "search-assets", name: "Search Assets", description: "Search saved content and creative assets", category: "asset", provider: "engine", providerRef: "AssetsPlatformAPI", capabilities: [{ name: "asset-search" }], isActive: true },
];

function ok(value: string) {
  return { success: true as const, data: { text: value }, durationMs: 0 };
}

function fail(error: string) {
  return { success: false as const, error, durationMs: 0 };
}

const CONTENT_HANDLERS: Record<string, ToolHandler> = {
  "generate-written-content": async input => {
    const objective = (input.objective as string) ?? (input.request as string) ?? "Marketing content";
    const audienceName = (input.audience as string) ?? "General audience";
    const toneAnswer = ((input.tone as string) ?? "professional").toLowerCase();
    const tone = KNOWN_TONES.find(t => toneAnswer.includes(t)) ?? "professional";
    const cta = (input.cta as string) ?? "Learn More";
    const outputId: ContentOutputKind = "social-caption";
    const brief: ContentBrief = { objective, audienceName, tone, cta, language: "English" };
    const entry = await contentPlatformAPI.generateContent(brief, outputId, CONTENT_ORGANIZATION_ID);
    return ok(`Here's a draft: "${entry.primaryText ?? entry.shortText ?? ""}"`);
  },
  "improve-written-content": async input => {
    const entries = contentPlatformAPI.listHistory(CONTENT_ORGANIZATION_ID);
    const latest = entries.at(-1);
    if (!latest) return fail("I don't have any generated content yet to improve — generate something first.");
    const requestText = ((input.request as string) ?? "").toLowerCase();
    const action = requestText.includes("shorten") || requestText.includes("shorter") ? "shorten" : requestText.includes("expand") || requestText.includes("longer") ? "expand" : requestText.includes("seo") ? "improve-seo" : requestText.includes("readab") ? "improve-readability" : "rewrite";
    const updated = await contentPlatformAPI.applyContentAction(latest.id, action);
    return ok(`Updated: "${updated.primaryText ?? updated.shortText ?? ""}"`);
  },
  "search-assets": async input => {
    const query = (input.query as string) ?? (input.request as string) ?? "";
    const results = assetsPlatformAPI.listAssetSummaries().filter(a => !query || a.name.toLowerCase().includes(query.toLowerCase()));
    return ok(results.length > 0 ? `Found ${results.length} asset${results.length === 1 ? "" : "s"}: ${results.slice(0, 5).map(a => a.name).join(", ")}.` : "No matching assets found.");
  },
};

let registered = false;

/** Safe to call more than once. Registers metadata, tools, their real handlers, and the clarification slot profile for content generation. */
export function registerContentSkills(): void {
  if (registered) return;
  for (const tool of CONTENT_TOOLS) copilotToolRegistry.register(tool, CONTENT_HANDLERS[tool.id]);
  for (const skill of CONTENT_SKILLS) skillRegistry.register(skill);

  clarificationEngine.registerSlotProfile("generate-written-content", [
    { slot: "audience", question: "Who's this for?" },
    { slot: "tone", question: "What tone should it use?", options: [{ id: "professional", label: "Professional" }, { id: "friendly", label: "Friendly" }, { id: "persuasive", label: "Persuasive" }, { id: "conversational", label: "Conversational" }] },
    { slot: "cta", question: "What's the call to action?", options: [{ id: "learn-more", label: "Learn More" }, { id: "sign-up", label: "Sign Up" }, { id: "book-a-call", label: "Book a Call" }] },
  ]);

  registered = true;
}
