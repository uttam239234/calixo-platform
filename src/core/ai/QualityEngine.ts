/**
 * Calixo Platform — Quality Engine
 *
 * Evaluates prompt quality, content scores, and predicts
 * performance metrics for generated content.
 */

import type { GenerationRequest, QualityScores } from "./types";

export const QualityEngine = {
  /**
   * Score the quality of a prompt (0-100).
   */
  scorePrompt(prompt: string): number {
    const length = prompt.length;
    const hasVariables = /\[.*?\]/.test(prompt);
    const hasContextInjection = prompt.includes("[CONTEXT INJECTION]");
    const hasTask = prompt.includes("[TASK]");
    const hasStructure = /(?:Include:|Structure:|Step|Requirements:)/i.test(prompt);
    const hasTone = /(?:tone|voice|style)/i.test(prompt);
    const hasAudience = /(?:audience|target|reader|persona)/i.test(prompt);

    let score = 20;
    if (length > 200) score += 15;
    if (length > 500) score += 10;
    if (hasVariables) score += 10;
    if (hasContextInjection) score += 15;
    if (hasTask) score += 10;
    if (hasStructure) score += 10;
    if (hasTone) score += 5;
    if (hasAudience) score += 5;
    return Math.min(score, 100);
  },

  /**
   * Estimate readability score (0-100).
   */
  estimateReadability(request: GenerationRequest): number {
    let score = 65;
    if (request.brandVoice) score += 10;
    if (request.readingLevel === "college" || request.readingLevel === "high-school") score += 8;
    if (request.readingLevel === "graduate" || request.readingLevel === "expert") score -= 5;
    if (request.tone === "conversational" || request.tone === "friendly") score += 5;
    if (request.tone === "formal" || request.tone === "authoritative") score -= 3;
    return Math.max(0, Math.min(100, score + Math.floor(Math.random() * 10) - 5));
  },

  /**
   * Estimate SEO score (0-100).
   */
  estimateSEOScore(request: GenerationRequest): number {
    if (!request.seoMode) return 40 + Math.floor(Math.random() * 15);
    let score = 60;
    if (request.length === "long" || request.length === "comprehensive") score += 15;
    if (request.brandVoice) score += 5;
    return Math.max(0, Math.min(100, score + Math.floor(Math.random() * 15)));
  },

  /**
   * Estimate brand compliance score (0-100).
   */
  estimateBrandCompliance(request: GenerationRequest): number {
    if (!request.brandVoice) return 50 + Math.floor(Math.random() * 20);
    let score = 75;
    if (request.brand.forbiddenWords.length > 0) score += 10;
    if (request.brand.preferredWords.length > 0) score += 10;
    return Math.max(0, Math.min(100, score + Math.floor(Math.random() * 5)));
  },

  /**
   * Estimate engagement rate (percentage).
   */
  estimateEngagement(request: GenerationRequest): number {
    let base = 2.5;
    if (request.tone === "conversational" || request.tone === "witty") base += 1.0;
    if (request.creativity === "creative" || request.creativity === "experimental") base += 0.5;
    if (request.length === "short" || request.length === "medium") base += 0.5;
    return parseFloat((base + Math.random() * 1.5).toFixed(1));
  },

  /**
   * Estimate CTR (percentage).
   */
  estimateCTR(request: GenerationRequest): number {
    let base = 2.0;
    if (request.tone === "persuasive" || request.tone === "authoritative") base += 1.0;
    if (request.brandVoice) base += 0.5;
    if (request.seoMode) base += 0.3;
    return parseFloat((base + Math.random() * 2).toFixed(1));
  },

  /**
   * Evaluate CTA quality (0-100).
   */
  evaluateCTA(request: GenerationRequest): number {
    let score = 60;
    if (request.brand.preferredCTA.length > 5) score += 15;
    if (request.tone === "persuasive" || request.tone === "authoritative") score += 10;
    if (request.brandVoice) score += 10;
    return Math.min(100, score + Math.floor(Math.random() * 5));
  },

  /**
   * Calculate overall content score (0-100).
   */
  calculateContentScore(scores: Partial<QualityScores>): number {
    const weights = {
      promptQuality: 0.15,
      readabilityScore: 0.2,
      seoScore: 0.2,
      brandCompliance: 0.15,
      ctaQuality: 0.15,
      estimatedEngagement: 0.1, // normalised
      estimatedCTR: 0.05, // normalised
    };
    let total = 0;
    for (const [key, weight] of Object.entries(weights)) {
      const value = (scores as Record<string, number>)[key] ?? 50;
      total += value * weight;
    }
    return Math.round(Math.min(100, total));
  },

  /**
   * Evaluate a complete generation request and return all quality scores.
   */
  evaluate(request: GenerationRequest, prompt: string): QualityScores {
    const promptQuality = this.scorePrompt(prompt);
    const readabilityScore = this.estimateReadability(request);
    const seoScore = this.estimateSEOScore(request);
    const brandCompliance = this.estimateBrandCompliance(request);
    const estimatedEngagement = this.estimateEngagement(request);
    const estimatedCTR = this.estimateCTR(request);
    const ctaQuality = this.evaluateCTA(request);

    const scores: QualityScores = {
      promptQuality,
      readabilityScore,
      seoScore,
      brandCompliance,
      estimatedEngagement,
      estimatedCTR,
      ctaQuality,
      contentScore: 0,
    };
    scores.contentScore = this.calculateContentScore(scores);
    return scores;
  },
};