/**
 * Calixo Platform — Audience Context Service
 *
 * Resolves audience context for AI generation.
 * Injects target audience details into prompts for personalisation.
 */

import type { AudienceContext } from "./types";

const DEFAULT_AUDIENCE: AudienceContext = {
  audienceName: "Enterprise Marketers",
  ageGroup: "25-55",
  profession: "Marketing Managers, CMOs, Content Strategists",
  interests: ["content marketing", "AI automation", "ROI optimisation", "brand growth"],
  location: "Global",
  painPoints: ["low content engagement", "slow production cycles", "inconsistent brand voice"],
  goals: ["increase content ROI", "scale content operations", "maintain brand consistency"],
  communicationStyle: "Professional yet approachable, data-driven, strategic",
};

const AUDIENCE_PRESETS: Record<string, AudienceContext> = {
  "enterprise-marketers": DEFAULT_AUDIENCE,
  "small-business-owners": {
    audienceName: "Small Business Owners",
    ageGroup: "30-60",
    profession: "Founders, Small Business Owners, Solopreneurs",
    interests: ["growth hacking", "cost-effective marketing", "social media", "local SEO"],
    location: "Regional / Local",
    painPoints: ["limited marketing budget", "lack of marketing expertise", "time constraints"],
    goals: ["generate leads affordably", "build local brand awareness", "automate repetitive tasks"],
    communicationStyle: "Friendly, relatable, actionable with practical examples",
  },
  "ecommerce-managers": {
    audienceName: "E-Commerce Managers",
    ageGroup: "22-45",
    profession: "E-Commerce Directors, Digital Merchandisers, Growth Managers",
    interests: ["conversion optimisation", "product feed management", "retargeting", "marketplace growth"],
    location: "Global / Multi-region",
    painPoints: ["cart abandonment", "low repeat purchase rate", "inventory-content mismatch"],
    goals: ["boost conversion rates", "personalise product content at scale", "expand to new channels"],
    communicationStyle: "Results-oriented, metrics-heavy, fast-paced",
  },
  "agency-leads": {
    audienceName: "Agency Leads",
    ageGroup: "28-50",
    profession: "Agency Founders, Creative Directors, Account Managers",
    interests: ["client retention", "scalable creative ops", "white-label solutions", "pitching"],
    location: "Global",
    painPoints: ["managing multiple client brands", "inconsistent output quality", "undercharging"],
    goals: ["streamline client delivery", "differentiate agency offering", "increase profit margins"],
    communicationStyle: "Collaborative, creative, partnership-focused",
  },
};

export const AudienceContextService = {
  /**
   * Resolve audience context by audience identifier.
   */
  resolve(audienceId?: string): AudienceContext {
    if (audienceId && AUDIENCE_PRESETS[audienceId]) {
      return { ...AUDIENCE_PRESETS[audienceId] };
    }
    return { ...DEFAULT_AUDIENCE };
  },

  /**
   * Build audience context from partial input (e.g. from generator UI).
   */
  buildFromInput(input: Partial<AudienceContext> & { audienceName: string }): AudienceContext {
    return {
      audienceName: input.audienceName,
      ageGroup: input.ageGroup ?? DEFAULT_AUDIENCE.ageGroup,
      profession: input.profession ?? DEFAULT_AUDIENCE.profession,
      interests: input.interests ?? [...DEFAULT_AUDIENCE.interests],
      location: input.location ?? DEFAULT_AUDIENCE.location,
      painPoints: input.painPoints ?? [...DEFAULT_AUDIENCE.painPoints],
      goals: input.goals ?? [...DEFAULT_AUDIENCE.goals],
      communicationStyle: input.communicationStyle ?? DEFAULT_AUDIENCE.communicationStyle,
    };
  },

  /**
   * Get default audience context.
   */
  getDefault(): AudienceContext {
    return { ...DEFAULT_AUDIENCE };
  },
};