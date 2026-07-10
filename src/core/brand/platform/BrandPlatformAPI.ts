/**
 * Calixo Platform - Brand Platform API
 *
 * The sanctioned way another module (Media, Content, Analytics, Dashboard)
 * reads Brand data — wraps `BrandKitEngine` so no module needs to import it
 * directly. `Media`'s `MediaPromptOptimizer` is the one existing direct
 * consumer flagged by the architecture audit; migrating it to this facade
 * is tracked as follow-up (see Cross Module Compliance in the completion
 * report) — this phase adds the facade without touching Media's internals.
 */
import { BrandKitEngine } from "../BrandKitEngine";
import type { BrandStyleProfile, BrandSummary } from "./contracts";

export class BrandPlatformAPI {
  /** Colors/voice/logo for generation modules (Content Studio's "brand style" auto-fill) — not part of `BrandSummary`. */
  getBrandStyleProfile(id: string): BrandStyleProfile | undefined {
    const kit = BrandKitEngine.getBrand(id);
    if (!kit) return undefined;
    return {
      id: kit.id,
      brandName: kit.profile.brandName,
      colors: [kit.colors.primary.hex, kit.colors.secondary.hex, kit.colors.accent.hex].filter(Boolean),
      voiceTone: kit.voice.tone,
      writingStyle: kit.voice.writingStyle,
      preferredCTA: kit.voice.ctaStyle,
      forbiddenWords: [...kit.voice.forbiddenWords],
      preferredWords: [...kit.voice.preferredVocabulary],
      logoUrl: kit.logos.primary,
    };
  }

  getBrandSummary(id: string): BrandSummary | undefined {
    const kit = BrandKitEngine.getBrand(id);
    if (!kit) return undefined;
    const validation = BrandKitEngine.validate(id);
    return {
      id: kit.id,
      brandName: kit.profile.brandName,
      organizationId: kit.profile.organizationId,
      workspaceId: kit.profile.workspaceId,
      industry: kit.profile.industry,
      assetCount: kit.assets.length,
      validationScore: validation.overallScore,
    };
  }

  listBrandSummaries(organizationId?: string): BrandSummary[] {
    return BrandKitEngine.getAllBrands()
      .filter(b => !organizationId || b.profile.organizationId === organizationId)
      .map(b => this.getBrandSummary(b.id))
      .filter((summary): summary is BrandSummary => summary !== undefined);
  }
}

export const brandPlatformAPI = new BrandPlatformAPI();
