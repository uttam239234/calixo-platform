/** Calixo Platform — Brand Export Service */
import type { BrandKit, ExportOptions } from "./types";

export const BrandExportService = {
  export(brand: BrandKit, options: ExportOptions): string {
    switch (options.format) {
      case "bundle": return JSON.stringify({ brand, exportedAt: new Date().toISOString(), version: "2.0" }, null, 2);
      case "creative-presets": return JSON.stringify({ brand: brand.profile.brandName, colors: brand.colors, typography: brand.typography, voice: brand.voice, aiSettings: brand.aiSettings }, null, 2);
      case "ai-config": return JSON.stringify({ brand: brand.profile.brandName, aiSettings: brand.aiSettings, voice: { tone: brand.voice.tone, forbiddenWords: brand.voice.forbiddenWords, preferredVocabulary: brand.voice.preferredVocabulary } }, null, 2);
      case "design-tokens": return JSON.stringify({ colors: brand.colors, typography: brand.typography, spacing: brand.visualGuidelines.spacingStyle, cornerRadius: brand.visualGuidelines.cornerRadius }, null, 2);
      default: return JSON.stringify(brand, null, 2);
    }
  },
};