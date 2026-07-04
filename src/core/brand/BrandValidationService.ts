/** Calixo Platform — Brand Validation Service */
import type { BrandKit, BrandValidation, ValidationResult } from "./types";

export const BrandValidationService = {
  validate(brand: BrandKit): BrandValidation {
    const results: ValidationResult[] = [
      this.checkLogo(brand), this.checkColors(brand), this.checkTypography(brand),
      this.checkVoice(brand), this.checkCompleteness(brand),
    ];
    const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    const completeness = Math.round((results.filter(r => r.passed).length / results.length) * 100);
    return { overallScore: avgScore, completeness, results };
  },
  checkLogo(brand: BrandKit): ValidationResult {
    const issues: string[] = [];
    if (!brand.logos.primary) issues.push("Missing primary logo");
    if (brand.logos.minSize < 24) issues.push("Logo minimum size too small (<24px)");
    if (!brand.logos.usageRules.length) issues.push("No logo usage rules defined");
    return { category: "Logo", passed: issues.length === 0, score: issues.length === 0 ? 95 : issues.length === 1 ? 60 : 30, issues };
  },
  checkColors(brand: BrandKit): ValidationResult {
    const issues: string[] = [];
    const colors = Object.values(brand.colors);
    if (colors.length < 5) issues.push("Less than 5 brand colours defined");
    if (!brand.colors.primary) issues.push("Primary colour not set");
    if (!brand.colors.text) issues.push("Text colour not set");
    return { category: "Colours", passed: issues.length === 0, score: issues.length === 0 ? 90 : issues.length === 1 ? 65 : 40, issues };
  },
  checkTypography(brand: BrandKit): ValidationResult {
    const issues: string[] = [];
    if (!brand.typography.headingFont) issues.push("Heading font not defined");
    if (!brand.typography.bodyFont) issues.push("Body font not defined");
    if (Object.keys(brand.typography.typeScale).length < 3) issues.push("Type scale incomplete (less than 3 levels)");
    return { category: "Typography", passed: issues.length === 0, score: issues.length === 0 ? 88 : issues.length === 1 ? 60 : 35, issues };
  },
  checkVoice(brand: BrandKit): ValidationResult {
    const issues: string[] = [];
    if (!brand.voice.tone) issues.push("Brand tone not defined");
    if (!brand.voice.ctaStyle) issues.push("CTA style not defined");
    if (brand.voice.forbiddenWords.length === 0) issues.push("No forbidden words defined — consider adding for brand safety");
    return { category: "Voice", passed: issues.length === 0, score: issues.length === 0 ? 85 : issues.length === 1 ? 55 : 30, issues };
  },
  checkCompleteness(brand: BrandKit): ValidationResult {
    const issues: string[] = [];
    if (!brand.profile.mission) issues.push("Mission statement missing");
    if (!brand.profile.vision) issues.push("Vision statement missing");
    if (brand.assets.length < 2) issues.push("Fewer than 2 brand assets uploaded");
    return { category: "Completeness", passed: issues.length === 0, score: issues.length === 0 ? 90 : 50, issues };
  },
};