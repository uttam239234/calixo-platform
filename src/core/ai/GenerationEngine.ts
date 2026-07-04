/**
 * Calixo Platform — Generation Engine
 *
 * Central orchestrator for the AI content generation pipeline.
 * Coordinates BrandContextService, AudienceContextService, PlatformContextService,
 * PromptEngine, QualityEngine, and the AIOS mock layer.
 *
 * All future modules (Google Ads, Meta, LinkedIn, Email, SEO, CRM, Automation)
 * will call GenerationEngine.generate(request) — no direct dependency on Content Studio.
 */

import type { GenerationRequest, GenerationResult, HistoryEntry } from "./types";
import { BrandContextService } from "./BrandContextService";
import { AudienceContextService } from "./AudienceContextService";
import { PlatformContextService } from "./PlatformContextService";
import { PromptEngine } from "./PromptEngine";
import { QualityEngine } from "./QualityEngine";

// ============================================================================
// Pricing table (per 1K tokens, USD)
// ============================================================================

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "calixo-default": { input: 0.002, output: 0.004 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "claude-3-5": { input: 0.003, output: 0.015 },
};

// ============================================================================
// Mock content generators
// ============================================================================

function generateMockContent(request: GenerationRequest): string {
  const { brand, audience, contentType, tone } = request;
  const brandName = brand.brandName;
  const audienceName = audience.audienceName;

  const templates: Record<string, string> = {
    "blog-article": `# ${getBlogTitle(brandName)}

**By AI Content Studio** • ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

## Executive Summary

In today's rapidly evolving ${audienceName.toLowerCase()} landscape, organisations are increasingly turning to ${brandName}'s innovative solutions to drive measurable results. This comprehensive guide explores the strategies and best practices that leading enterprises use to achieve sustainable growth.

## Introduction

The ${brandName} approach to content strategy has transformed how businesses connect with their audiences. With ${getRandomStat()} improvement in engagement and a ${getRandomStat()} increase in conversion rates, the data speaks for itself.

## Key Strategies for Success

### 1. Data-Driven Decision Making
Modern content teams leverage real-time analytics to understand what resonates. ${brandName}'s platform provides actionable insights that help teams optimise every piece of content.

### 2. AI-Powered Personalisation
Artificial intelligence enables hyper-personalisation at scale. By analysing ${audienceName} behaviour patterns, ${brandName} delivers tailored content experiences that drive engagement.

### 3. Omnichannel Distribution
Content must reach audiences where they are. From social media to email, ${brandName} ensures seamless cross-channel distribution with consistent brand messaging.

### 4. Continuous Optimisation
The content landscape evolves rapidly. ${brandName}'s continuous improvement framework ensures content stays relevant and impactful.

## Implementation Framework

1. **Assessment Phase** — Evaluate your current content strategy
2. **Strategy Development** — Build a data-backed content plan
3. **Execution** — Deploy content across channels
4. **Measurement** — Track KPIs and iterate

## Conclusion

${brandName} empowers organisations to transform their content operations. By embracing these strategies, your team can achieve exceptional results in today's competitive landscape.

---

*Generated using ${brandName}'s AI Content Studio with enterprise-grade AI*`,

    "instagram-caption": `${getEmoji()} ${getInstaHook()}\n\n${getInstaBody()}\n\n✨ ${getRandomStat()} engagement increase with this strategy\n\n${getEmoji()} ${getEmoji()} ${getEmoji()}\n\n👇 Drop your thoughts below!\n🔗 Link in bio for the full guide\n\n#${brandName.replace(/\s+/g, "")} #ContentStrategy #AIContent #MarketingTips`,

    "linkedin-post": `${getLinkedInHook()}\n\nThe numbers are clear: ${getRandomStat()} of enterprises that adopt AI-powered content strategies see measurable ROI within the first quarter.\n\nHere's what I've learned implementing this at ${brandName}:\n\n📊 Data Strategy comes first. Without clean data, AI generates noise.\n🎯 Personalisation at scale is no longer optional — it's expected.\n⚡ Speed matters. Teams using ${brandName} ship content 3x faster.\n🔄 Iteration beats perfection. Ship, measure, optimise, repeat.\n\nThe most successful teams I work with share one trait: they treat content as a product, not a project.\n\nWhat's your biggest content challenge right now? Let's discuss in the comments. 👇\n\n#ContentMarketing #AI #EnterpriseMarketing #${brandName.replace(/\s+/g, "")}`,

    "email": `Subject: ${getRandomStat()} Better Results with ${brandName} 🚀\n\nHi there,\n\nWhat if you could ${getEmailHook()}?\n\nThat's exactly what teams using ${brandName} achieve every day.\n\nHere's what makes the difference:\n\n✨ **AI-Powered Insights** — Know exactly what resonates\n📊 **Real-Time Analytics** — Make data-driven decisions\n🎯 **Personalisation at Scale** — Reach every ${audienceName} segment\n⚡ **3x Faster Publishing** — Ship quality content consistently\n\n**The Results Speak Volumes:**\n• ${getRandomStat()} increase in content engagement\n• ${getRandomStat()} reduction in production time\n• ${getRandomStat()} improvement in conversion rates\n\nReady to transform your content strategy?\n\n[Get Started with ${brandName} →]\n\nQuestions? Reply to this email — we're here to help.\n\nBest,\nThe ${brandName} Team`,

    "google-search-ad": `Headline 1: ${brandName} | AI Content Platform\nHeadline 2: ${getRandomStat()} Content ROI\nHeadline 3: Start Free Today\n\nDescription 1: ${brandName} helps ${audienceName} teams create, optimise, and distribute high-performing content with AI. Boost engagement by ${getRandomStat()}.\n\nDescription 2: Enterprise-ready AI content platform. 10,000+ teams trust ${brandName}. Schedule a demo or start your free trial. No credit card required.`,

    "landing-page": `# Transform Your Content Strategy with ${brandName}\n\n**AI-Powered Content Platform for ${audienceName}**\n\n---\n\n## Stop Guessing. Start Growing.\n\nMost content teams spend 60% of their time on manual tasks. ${brandName} automates the workflow so you can focus on strategy.\n\n### Key Benefits\n\n✅ **${getRandomStat()} Faster Production** — Generate, edit, and publish in minutes\n✅ **${getRandomStat()} Higher Engagement** — AI-optimised content that resonates\n✅ **Enterprise Security** — SOC 2 compliant, role-based access\n✅ **Omnichannel Ready** — Blog, social, ads, email, and more\n\n[Start Free Trial] [Book Demo]\n\n---\n\n*"${brandName} transformed how we create content. Our team ships 3x more content with better results."*\n— Enterprise Customer, ${getCompanyName()}*`,
  };

  return templates[contentType] ?? templates["blog-article"];
}

// ============================================================================
// Helpers
// ============================================================================

function getBlogTitle(brand: string): string {
  const titles = [
    `The Enterprise Guide to AI-Powered Content Strategy`,
    `How Leading Brands Achieve 10x Content ROI with ${brand}`,
    `The Future of Content Marketing: AI, Automation, and Authenticity`,
    `Building a Data-Driven Content Engine That Scales`,
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getInstaHook(): string { const hooks = ["The content strategy that changed everything for us 👀", "Stop scrolling — this will save you hours of content work", "We tested 1,000 content pieces. Here's what actually works."]; return hooks[Math.floor(Math.random() * hooks.length)]; }
function getInstaBody(): string { const bodies = ["After months of testing and optimising, we finally cracked the code on what makes content perform. The secret? It's not about posting more — it's about posting smarter.", "Enterprise content doesn't have to be boring. We've been using AI to inject personality into every piece, and the results are incredible."]; return bodies[Math.floor(Math.random() * bodies.length)]; }
function getLinkedInHook(): string { const hooks = ["I've analysed over 10,000 content pieces across enterprise brands. Here's the uncomfortable truth about what's working in 2025:", "Most content teams are leaving 70% of their potential ROI on the table. Here's why:", "After 5 years leading content strategy, I've identified the 3 factors that separate top-performing content from everything else:"]; return hooks[Math.floor(Math.random() * hooks.length)]; }
function getEmailHook(): string { const hooks = ["create content that your audience actually wants to read", "automate 80% of your content workflow", "double your content engagement in 30 days"]; return hooks[Math.floor(Math.random() * hooks.length)]; }
function getRandomStat(): string { const stats = ["47%", "3.2x", "85%", "62%", "2.8x", "73%", "94%"]; return stats[Math.floor(Math.random() * stats.length)]; }
function getEmoji(): string { const emojis = ["🚀", "✨", "💡", "🔥", "📈", "🎯", "⚡"]; return emojis[Math.floor(Math.random() * emojis.length)]; }
function getCompanyName(): string { const names = ["Acme Corp", "TechVentures Inc", "Global Marketing Solutions", "NexGen Media"]; return names[Math.floor(Math.random() * names.length)]; }

// ============================================================================
// Generation History
// ============================================================================

const history: HistoryEntry[] = [];
const MAX_HISTORY = 100;

// ============================================================================
// Engine
// ============================================================================

export const GenerationEngine = {
  /**
   * Main entry point: orchestrate the full generation pipeline.
   *
   * Future modules call this directly:
   * ```
   * const result = await GenerationEngine.generate({
   *   contentType: "google-search-ad",
   *   platform: "google-ads",
   *   brand: BrandContextService.getDefault(),
   *   audience: AudienceContextService.getDefault(),
   *   ...
   * });
   * ```
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = performance.now();

    // 1. Resolve context
    const brand = BrandContextService.buildFromInput({ ...request.brand });
    const audience = AudienceContextService.buildFromInput({ ...request.audience });
    const platform = PlatformContextService.mapContentTypeToPlatform(request.contentType);

    const enrichedRequest: GenerationRequest = {
      ...request,
      brand,
      audience,
      platform,
    };

    // 2. Build final prompt via PromptEngine
    const { finalPrompt, template } = PromptEngine.buildFinalPrompt(enrichedRequest);

    // 3. Estimate tokens and cost
    const inputTokens = Math.ceil(finalPrompt.length / 4);
    const outputTokens = estimateOutputTokens(enrichedRequest);
    const cost = estimateCost(request.model, inputTokens, outputTokens);

    // 4. Generate content (mock — replace with aiService.chat() for production)
    const generationDelay = 800 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, generationDelay));
    const content = generateMockContent(enrichedRequest);

    const generationTimeMs = Math.round(performance.now() - startTime);
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const tokensUsed = inputTokens + outputTokens;

    // 5. Evaluate quality
    const quality = QualityEngine.evaluate(enrichedRequest, finalPrompt);

    // 6. Generate suggestions
    const suggestions = generateSuggestions(enrichedRequest, quality);

    const result: GenerationResult = {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      request: enrichedRequest,
      finalPrompt,
      metadata: {
        model: request.model,
        tokensUsed,
        generationTimeMs,
        cost,
        characterCount: charCount,
        wordCount,
      },
      quality,
      suggestions,
    };

    // 7. Record history
    recordHistory({ id: result.id, timestamp: new Date().toISOString(), request: enrichedRequest, result });

    return result;
  },

  /**
   * Get generation history (latest first).
   */
  getHistory(): HistoryEntry[] {
    return [...history].reverse();
  },

  /**
   * Clear all history.
   */
  clearHistory(): void {
    history.length = 0;
  },

  /**
   * Estimate tokens for a request without generating.
   */
  estimateTokens(request: GenerationRequest): { input: number; output: number } {
    const { finalPrompt } = PromptEngine.buildFinalPrompt(request);
    return {
      input: Math.ceil(finalPrompt.length / 4),
      output: estimateOutputTokens(request),
    };
  },

  /**
   * Estimate cost for a request without generating.
   */
  estimateCost(request: GenerationRequest): number {
    const { input, output } = this.estimateTokens(request);
    return estimateCost(request.model, input, output);
  },
};

// ============================================================================
// Internal helpers
// ============================================================================

function estimateOutputTokens(request: GenerationRequest): number {
  const base: Record<string, number> = { short: 200, medium: 500, long: 1500, comprehensive: 3000 };
  return base[request.length] ?? 500;
}

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["calixo-default"];
  return parseFloat(((inputTokens * pricing.input + outputTokens * pricing.output) / 1000).toFixed(4));
}

function recordHistory(entry: HistoryEntry): void {
  history.push(entry);
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
}

function generateSuggestions(request: GenerationRequest, quality: import("./types").QualityScores): string[] {
  const suggestions: string[] = [];
  if (quality.seoScore < 70) suggestions.push("Increase content length or enable SEO mode for better SEO scores");
  if (quality.brandCompliance < 70) suggestions.push("Enable Brand Voice mode and add preferred/forbidden words for stronger brand compliance");
  if (quality.readabilityScore < 70) suggestions.push("Consider a more conversational tone or lower reading level for better readability");
  if (request.prompt.length < 100) suggestions.push("Write a more detailed prompt — include structure, tone, and audience instructions");
  suggestions.push("Add a statistic in the opening paragraph to increase credibility");
  suggestions.push("Consider adding relevant internal links to improve SEO value");
  suggestions.push("Include a customer testimonial or social proof element");
  suggestions.push("Add visual element suggestions (charts, infographics, screenshots)");
  return suggestions.slice(0, 5);
}