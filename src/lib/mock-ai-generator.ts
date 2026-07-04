/**
 * Calixo Platform — Mock AI Content Generator
 *
 * Uses the AIOS abstraction layer. Replace the mock provider with
 * real OpenAI/Anthropic/Google integration when ready.
 *
 * Integration points:
 * 1. Replace generateContent() body with aiService.chat() call
 * 2. Replace estimateTokens() with tokenizer (tiktoken/Anthropic)
 * 3. Replace costEstimate() with actual pricing table
 */

import type { PromptTemplate } from "@/lib/prompt-templates";

// ============================================================================
// Types
// ============================================================================

export type ContentTypeOption =
  | "blog-article"
  | "facebook-post"
  | "instagram-caption"
  | "linkedin-post"
  | "x-post"
  | "google-search-ad"
  | "google-display-ad"
  | "meta-ad"
  | "email"
  | "landing-page"
  | "product-description"
  | "press-release"
  | "video-script"
  | "cta"
  | "headline";

export type ToneOption =
  | "professional"
  | "conversational"
  | "persuasive"
  | "authoritative"
  | "friendly"
  | "witty"
  | "empathetic"
  | "formal";

export type LengthOption = "short" | "medium" | "long" | "comprehensive";
export type ReadingLevelOption = "elementary" | "middle-school" | "high-school" | "college" | "graduate" | "expert";
export type CreativityOption = "conservative" | "balanced" | "creative" | "experimental";

export interface GeneratorConfig {
  contentType: ContentTypeOption;
  brand: string;
  audience: string;
  campaign: string;
  language: string;
  tone: ToneOption;
  length: LengthOption;
  readingLevel: ReadingLevelOption;
  creativity: CreativityOption;
  seoMode: boolean;
  brandVoice: boolean;
  model: string;
  prompt: string;
  selectedTemplateId: string | null;
}

export interface GenerationResult {
  id: string;
  content: string;
  metadata: {
    contentType: ContentTypeOption;
    tone: ToneOption;
    model: string;
    tokensUsed: number;
    generationTime: number;
    cost: number;
    characterCount: number;
    wordCount: number;
  };
  metrics: {
    readabilityScore: number;
    seoScore: number;
    brandVoiceScore: number;
    estimatedEngagement: number;
    estimatedCTR: number;
    contentScore: number;
  };
  suggestions: string[];
}

// ============================================================================
// Pricing table (per 1K tokens, USD)
// ============================================================================

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "calixo-default": { input: 0.002, output: 0.004 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "claude-3-5": { input: 0.003, output: 0.015 },
};

// ============================================================================
// Mock generated content
// ============================================================================

function generateMockContent(config: GeneratorConfig): string {
  const templates: Record<string, string> = {
    "blog-article": `# ${getBlogTitle()}

**By AI Content Studio** • ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

## Executive Summary

In today's rapidly evolving ${config.audience.toLowerCase()} landscape, organizations are increasingly turning to ${config.brand}'s innovative solutions to drive measurable results. This comprehensive guide explores the strategies and best practices that leading enterprises use to achieve sustainable growth.

## Introduction

The ${config.brand} approach to content strategy has transformed how businesses connect with their audiences. With ${getRandomStat()} improvement in engagement and a ${getRandomStat()} increase in conversion rates, the data speaks for itself.

## Key Strategies for Success

### 1. Data-Driven Decision Making
Modern content teams leverage real-time analytics to understand what resonates. ${config.brand}'s platform provides actionable insights that help teams optimize every piece of content.

### 2. AI-Powered Personalization
Artificial intelligence enables hyper-personalization at scale. By analyzing ${config.audience.toLowerCase()} behavior patterns, ${config.brand} delivers tailored content experiences that drive engagement.

### 3. Omnichannel Distribution
Content must reach audiences where they are. From social media to email, ${config.brand} ensures seamless cross-channel distribution with consistent brand messaging.

### 4. Continuous Optimization
The content landscape evolves rapidly. ${config.brand}'s continuous improvement framework ensures content stays relevant and impactful.

## Implementation Framework

1. **Assessment Phase** — Evaluate your current content strategy
2. **Strategy Development** — Build a data-backed content plan
3. **Execution** — Deploy content across channels
4. **Measurement** — Track KPIs and iterate

## Conclusion

${config.brand} empowers organizations to transform their content operations. By embracing these strategies, your team can achieve exceptional results in today's competitive landscape.

---

*Generated using ${config.brand}'s AI Content Studio with ${config.model}*`,

    "instagram-caption": `${getEmoji()} ${getInstaHook()}

${getInstaBody()}

✨ ${getRandomStat()} engagement increase with this strategy

${getEmoji()} ${getEmoji()} ${getEmoji()}

👇 Drop your thoughts below!
🔗 Link in bio for the full guide

#${config.brand.replace(/\s+/g, "")} #ContentStrategy #AIContent #MarketingTips #GrowthHacking #EnterpriseSEO #SocialMediaStrategy #BrandBuilding #DigitalMarketing #CreativeContent #ContentCreation`,

    "linkedin-post": `${getLinkedInHook()}

The numbers are clear: ${getRandomStat()} of enterprises that adopt AI-powered content strategies see measurable ROI within the first quarter.

Here's what I've learned implementing this at ${config.brand}:

📊 Data Strategy comes first. Without clean data, AI generates noise.
🎯 Personalization at scale is no longer optional — it's expected.
⚡ Speed matters. Teams using ${config.brand} ship content 3x faster.
🔄 Iteration beats perfection. Ship, measure, optimize, repeat.

The most successful teams I work with share one trait: they treat content as a product, not a project.

What's your biggest content challenge right now? Let's discuss in the comments. 👇

#ContentMarketing #AI #EnterpriseMarketing #${config.brand.replace(/\s+/g, "")}`,

    "x-post": `Thread 🧵: How we increased ${config.audience.toLowerCase()} engagement by ${getRandomStat()} using ${config.brand}'s AI platform:

1/ Content volume isn't the problem. Relevance is. Most teams publish too much irrelevant content. Focus on quality over quantity.

2/ AI doesn't replace creativity — it amplifies it. Our best-performing content combines human insight with AI-powered optimization.

3/ Distribution > Creation. The best content in the world is worthless if nobody sees it. Build distribution into your strategy from day one.

4/ Measure what matters. Vanity metrics lie. Track conversions, engagement depth, and customer lifetime value.

5/ The biggest mistake? Not starting. The tools exist. The frameworks exist. Start today. Iterate tomorrow.

What's holding your team back? 🚀`,

    "email": `Subject: ${getRandomStat()} Better Results with ${config.brand} 🚀

Hi there,

What if you could ${getEmailHook()}?

That's exactly what teams using ${config.brand} achieve every day.

Here's what makes the difference:

✨ **AI-Powered Insights** — Know exactly what resonates
📊 **Real-Time Analytics** — Make data-driven decisions
🎯 **Personalization at Scale** — Reach every ${config.audience.toLowerCase()} segment
⚡ **3x Faster Publishing** — Ship quality content consistently

**The Results Speak Volumes:**
• ${getRandomStat()} increase in content engagement
• ${getRandomStat()} reduction in production time
• ${getRandomStat()} improvement in conversion rates

Ready to transform your content strategy?

[Get Started with ${config.brand} →]

Questions? Reply to this email — we're here to help.

Best,
The ${config.brand} Team`,

    "google-search-ad": `Headline 1: ${config.brand} | AI Content Platform
Headline 2: ${getRandomStat()} Content ROI
Headline 3: Start Free Today

Description 1: ${config.brand} helps ${config.audience.toLowerCase()} teams create, optimize, and distribute high-performing content with AI. Boost engagement by ${getRandomStat()}.

Description 2: Enterprise-ready AI content platform. 10,000+ teams trust ${config.brand}. Schedule a demo or start your free trial. No credit card required.`,

    "landing-page": `# Transform Your Content Strategy with ${config.brand}

**AI-Powered Content Platform for ${config.audience}**

---

## Stop Guessing. Start Growing.

Most content teams spend 60% of their time on manual tasks. ${config.brand} automates the workflow so you can focus on strategy.

### Key Benefits

✅ **${getRandomStat()} Faster Production** — Generate, edit, and publish in minutes
✅ **${getRandomStat()} Higher Engagement** — AI-optimized content that resonates
✅ **Enterprise Security** — SOC 2 compliant, role-based access
✅ **Omnichannel Ready** — Blog, social, ads, email, and more

[Start Free Trial] [Book Demo]

---

*"${config.brand} transformed how we create content. Our team ships 3x more content with better results."*
— Enterprise Customer, ${getCompanyName()}*`,
  };

  return templates[config.contentType] ?? templates["blog-article"];
}

// ============================================================================
// Helper generators
// ============================================================================

function getBlogTitle(): string {
  const titles = [
    "The Enterprise Guide to AI-Powered Content Strategy",
    "How Leading Brands Achieve 10x Content ROI",
    "The Future of Content Marketing: AI, Automation, and Authenticity",
    "Building a Data-Driven Content Engine That Scales",
    "Why Content Personalization Is Your Biggest Growth Lever",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getInstaHook(): string {
  const hooks = [
    "The content strategy that changed everything for us 👀",
    "Stop scrolling — this will save you hours of content work",
    "We tested 1,000 content pieces. Here's what actually works.",
    "POV: You just discovered the secret to viral content",
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function getInstaBody(): string {
  const bodies = [
    "After months of testing and optimizing, we finally cracked the code on what makes content perform. The secret? It's not about posting more — it's about posting smarter. Here's what we learned...",
    "Enterprise content doesn't have to be boring. We've been using AI to inject personality into every piece, and the results are incredible. Engagement up, bounce rates down, and most importantly — customers are actually reading.",
  ];
  return bodies[Math.floor(Math.random() * bodies.length)];
}

function getLinkedInHook(): string {
  const hooks = [
    "I've analyzed over 10,000 content pieces across enterprise brands. Here's the uncomfortable truth about what's working in 2025:",
    "Most content teams are leaving 70% of their potential ROI on the table. Here's why:",
    "After 5 years leading content strategy at [Company], I've identified the 3 factors that separate top-performing content from everything else:",
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function getEmailHook(): string {
  const hooks = [
    "create content that your audience actually wants to read",
    "automate 80% of your content workflow",
    "double your content engagement in 30 days",
    "build a content engine that runs on autopilot",
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function getRandomStat(): string {
  const stats = ["47%", "3.2x", "85%", "62%", "2.8x", "73%", "94%", "4.1x"];
  return stats[Math.floor(Math.random() * stats.length)];
}

function getEmoji(): string {
  const emojis = ["🚀", "✨", "💡", "🔥", "📈", "🎯", "⚡", "🌟"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getCompanyName(): string {
  const names = ["Acme Corp", "TechVentures Inc", "Global Marketing Solutions", "NexGen Media", "Stratosphere Digital"];
  return names[Math.floor(Math.random() * names.length)];
}

// ============================================================================
// Public API
// ============================================================================

export const MockAIGenerator = {
  /**
   * Simulate AI content generation with realistic delay.
   */
  async generateContent(config: GeneratorConfig): Promise<GenerationResult> {
    // Simulate generation delay
    const generationTime = 1500 + Math.random() * 2500;
    await new Promise((resolve) => setTimeout(resolve, generationTime));

    const content = generateMockContent(config);
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const tokensUsed = Math.ceil(charCount / 4);

    return {
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      metadata: {
        contentType: config.contentType,
        tone: config.tone,
        model: config.model,
        tokensUsed,
        generationTime: Math.round(generationTime),
        cost: this.estimateCost(config.model, 500, tokensUsed),
        characterCount: charCount,
        wordCount,
      },
      metrics: {
        readabilityScore: Math.floor(Math.random() * 30) + 65,
        seoScore: config.seoMode ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 50,
        brandVoiceScore: config.brandVoice ? Math.floor(Math.random() * 15) + 80 : Math.floor(Math.random() * 30) + 55,
        estimatedEngagement: parseFloat((Math.random() * 4 + 2).toFixed(1)),
        estimatedCTR: parseFloat((Math.random() * 5 + 1).toFixed(1)),
        contentScore: Math.floor(Math.random() * 25) + 70,
      },
      suggestions: [
        "Add a statistic in the opening paragraph to increase credibility",
        "Consider breaking the middle section into shorter paragraphs",
        "Add 2-3 relevant internal links to improve SEO value",
        "Include a customer testimonial or social proof element",
        "Add visual element suggestions (charts, infographics, screenshots)",
      ],
    };
  },

  /**
   * Estimate token count from prompt + config.
   */
  estimateTokens(promptLength: number, config: GeneratorConfig): number {
    const baseMap: Partial<Record<LengthOption, number>> = {
      short: 200,
      medium: 500,
      long: 1500,
      comprehensive: 3000,
    };
    return (baseMap[config.length] ?? 500) + promptLength / 4;
  },

  /**
   * Estimate generation cost in USD.
   */
  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["calixo-default"];
    return parseFloat(((inputTokens * pricing.input + outputTokens * pricing.output) / 1000).toFixed(4));
  },

  /**
   * Score prompt quality (0-100).
   */
  scorePrompt(prompt: string): number {
    const length = prompt.length;
    const hasVariables = /\[.*?\]/.test(prompt);
    const hasContext = prompt.length > 50;
    const hasStructure = prompt.includes("Include:") || prompt.includes("Structure:") || prompt.includes("Step");

    let score = 30;
    if (length > 100) score += 20;
    if (length > 300) score += 10;
    if (hasVariables) score += 15;
    if (hasContext) score += 10;
    if (hasStructure) score += 15;
    return Math.min(score, 100);
  },
};