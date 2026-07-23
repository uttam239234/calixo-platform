/**
 * Calixo Platform — Content Orchestration Engine
 *
 * The seam between Content Studio's simplified `ContentBrief` and the full request shapes the
 * real engines require. Never reimplements generation/layout/quality/brand/asset logic — it only
 * translates and calls `GenerationEngine` / `CreativeEngine` / `MediaPlatformAPI`.
 *
 * "Variants" for content outputs are genuinely different text: the underlying mock
 * `GenerationEngine` templates embed randomized hook/stat/emoji helpers, so calling `generate()`
 * again with the same request produces real (if mock) variation — not a fabricated duplicate.
 * "Translate" and image localization are disclosed deterministic placeholders (the UI copy says
 * so explicitly), matching this session's rule against fabricated AI text — "prepared for a
 * future real translation/localization API," never invented as if real.
 */
import { GenerationEngine } from "@/core/ai/GenerationEngine";
import { BrandContextService } from "@/core/ai/BrandContextService";
import { AudienceContextService } from "@/core/ai/AudienceContextService";
import type { GenerationRequest } from "@/core/ai/types";
import { CreativeEngine } from "@/core/creative/CreativeEngine";
import { CreativeTypeService } from "@/core/creative/CreativeTypeService";
import { PlatformKnowledgeService } from "@/core/creative/PlatformKnowledgeService";
import type { CreativeRequest, CreativeResult } from "@/core/creative/types";
import { mediaPlatformAPI } from "@/core/media/platform/MediaPlatformAPI";
import type { MediaRequest } from "@/core/media/types";
import { ContentIntelligenceEngine } from "@/core/intelligence/ContentIntelligenceEngine";
import { brandPlatformAPI } from "@/core/brand";
import { OutputCatalogRegistry } from "../registry/OutputCatalogRegistry";
import type {
  ContentAction,
  ContentBrief,
  ContentOutputCatalogEntry,
  ContentOutputKind,
  CreativeOutputKind,
  CreativeVariation,
  GenerationHistoryEntry,
  LocalizedVersion,
  PlatformVersion,
} from "../types";

/**
 * Four distinct layout directives appended to the same production prompt so each of Creative
 * Design Studio's real image-generation calls produces a genuinely different composition —
 * "different layout, same campaign identity," per the brief — rather than 4 near-identical
 * re-rolls of one prompt.
 */
const LAYOUT_VARIATIONS: { label: string; directive: string }[] = [
  { label: "Bold Hero", directive: "Layout composition: bold centered hero — headline dominant near the top, one strong focal image below, generous breathing room." },
  { label: "Split Panel", directive: "Layout composition: split-panel — visual fills one half of the frame, headline and CTA block anchored in the other half." },
  { label: "Asymmetric Grid", directive: "Layout composition: asymmetric grid — off-center focal point, logo and CTA anchored to a bottom corner, dynamic diagonal balance." },
  { label: "Minimalist", directive: "Layout composition: minimalist — large negative space, one small centered focal element, ultra-restrained typography." },
];

function toneToVisualStyle(tone: ContentBrief["tone"]): string {
  const map: Record<string, string> = {
    professional: "corporate",
    conversational: "modern",
    persuasive: "bold",
    authoritative: "corporate",
    friendly: "vibrant",
    witty: "creative",
    empathetic: "minimalist",
    formal: "corporate",
  };
  return map[tone] ?? "modern";
}

function deriveShortText(primary: string): string {
  const plain = primary.replace(/[#*_>`]/g, "").trim();
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(Boolean);
  const short = sentences.slice(0, 2).join(" ").trim();
  return short.length > 0 ? short : plain.slice(0, 160);
}

function deriveLongText(primary: string, brief: ContentBrief): string {
  const extra = `Created for ${brief.audienceName} with the goal: "${brief.objective}".${brief.cta ? ` Next step: ${brief.cta}.` : ""}`;
  return `${primary}\n\n${extra}`;
}

function deriveHashtags(primary: string, brief: ContentBrief): string[] {
  const existing = Array.from(new Set(primary.match(/#[A-Za-z0-9]+/g) ?? []));
  if (existing.length > 0) return existing.slice(0, 6);
  const words = `${brief.objective} ${brief.audienceName}`
    .split(/\s+/)
    .map(w => w.replace(/[^A-Za-z0-9]/g, ""))
    .filter(w => w.length > 3);
  return Array.from(new Set(words)).slice(0, 4).map(w => `#${w}`);
}

function deriveCtaVariations(cta: string): string[] {
  const base = (cta || "Learn More").trim();
  return Array.from(new Set([base, `${base} Today`, `Get Started: ${base}`]));
}

const TRANSLATION_LABEL: Record<string, string> = {
  Spanish: "ES", French: "FR", German: "DE", Hindi: "HI", Portuguese: "PT", Arabic: "AR", Mandarin: "ZH",
};

function translateDeterministic(text: string, targetLanguage: string): string {
  const tag = TRANSLATION_LABEL[targetLanguage] ?? targetLanguage.slice(0, 2).toUpperCase();
  return `[${tag}] ${text}\n\n(Localized for ${targetLanguage} — a deterministic placeholder prepared for a future real translation API, not a live translation.)`;
}

function buildMediaRequest(creativeResult: CreativeResult, brandName: string, colors: string[], dimensions?: { width: number; height: number }, negativePromptExtra?: string): MediaRequest {
  return {
    // Root-cause fix (production incident): `MediaGenerationEngine.generateImage()` resolves
    // `request.provider || "mock-media"` — every creative generation silently fell back to the
    // mock provider because this field was never set here, regardless of whether a real image
    // generator was ever injected via `setRealImageGenerator()`. Every "generated" creative was a
    // picsum.photos placeholder, never a real image.
    provider: "openai-image",
    action: "generate",
    mediaType: "image",
    prompt: creativeResult.prompt.prompt,
    negativePrompt: [creativeResult.prompt.negativePrompt, negativePromptExtra].filter(Boolean).join(", "),
    dimensions: dimensions ?? { width: creativeResult.dimensions.width, height: creativeResult.dimensions.height },
    quality: "standard",
    style: creativeResult.futureImagePayload.stylePreset,
    outputFormat: "png",
    brand: { name: brandName, colors, voice: "" },
    platform: creativeResult.platform,
    creativeType: creativeResult.creativeType,
    campaign: "quick-create",
  };
}

class ContentOrchestrationEngineImpl {
  private history: GenerationHistoryEntry[] = [];

  /** Seeds a few realistic entries so "My Creations" isn't empty on first load — only takes effect once, before any real generation happens. */
  seedHistory(entries: GenerationHistoryEntry[]): void {
    if (this.history.length === 0) this.history = [...entries];
  }

  listHistory(organizationId: string): GenerationHistoryEntry[] {
    return this.history
      .filter(entry => entry.organizationId === organizationId)
      .slice()
      .reverse();
  }

  getHistoryEntry(id: string): GenerationHistoryEntry | undefined {
    return this.history.find(entry => entry.id === id);
  }

  private resolveBrand(brief: ContentBrief) {
    const style = brief.brandStyleId ? brandPlatformAPI.getBrandStyleProfile(brief.brandStyleId) : undefined;
    const brand = BrandContextService.buildFromInput({
      brandName: style?.brandName ?? "Calixo",
      voice: style?.voiceTone,
      writingStyle: style?.writingStyle,
      preferredCTA: brief.cta || style?.preferredCTA,
      forbiddenWords: style?.forbiddenWords,
      preferredWords: style?.preferredWords,
    });
    return { brand, colors: style?.colors ?? [], logoUrl: style?.logoUrl };
  }

  private buildGenerationRequest(brief: ContentBrief, catalogEntry: ContentOutputCatalogEntry, overrides: Partial<GenerationRequest> = {}): GenerationRequest {
    const { brand } = this.resolveBrand(brief);
    const audience = AudienceContextService.buildFromInput({ audienceName: brief.audienceName });
    return {
      contentType: catalogEntry.contentType,
      platform: catalogEntry.platform,
      brand,
      audience,
      campaign: brief.campaignId ?? "quick-create",
      language: brief.language || "English",
      tone: brief.tone,
      length: catalogEntry.defaultLength,
      readingLevel: "college",
      creativity: brief.strictBrandRules ? "conservative" : "balanced",
      seoMode: true,
      brandVoice: true,
      model: "calixo-default",
      prompt: brief.objective,
      templateId: null,
      ...overrides,
    };
  }

  async generateContent(brief: ContentBrief, outputId: ContentOutputKind, organizationId: string): Promise<GenerationHistoryEntry> {
    const catalogEntry = OutputCatalogRegistry.getContent(outputId);
    if (!catalogEntry) throw new Error(`Unknown content output: ${outputId}`);

    const request = this.buildGenerationRequest(brief, catalogEntry);
    const primary = await GenerationEngine.generate(request);
    const variant = await GenerationEngine.generate(request);
    const textVariants = variant.content !== primary.content ? [variant.content] : [];

    const entry: GenerationHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "content",
      outputId,
      outputLabel: catalogEntry.label,
      createdAt: new Date().toISOString(),
      organizationId,
      brief,
      primaryText: primary.content,
      shortText: deriveShortText(primary.content),
      longText: deriveLongText(primary.content, brief),
      textVariants,
      hashtags: deriveHashtags(primary.content, brief),
      ctaVariations: deriveCtaVariations(brief.cta),
    };
    this.history.push(entry);
    return entry;
  }

  async generateCreative(brief: ContentBrief, outputId: CreativeOutputKind, organizationId: string, variationCount = 4): Promise<GenerationHistoryEntry> {
    const catalogEntry = OutputCatalogRegistry.getCreative(outputId);
    if (!catalogEntry) throw new Error(`Unknown creative output: ${outputId}`);

    const { brand, colors, logoUrl } = this.resolveBrand(brief);
    const paletteColors = colors.length > 0 ? colors : ["#4F46E5", "#7C3AED"];

    const creativeRequest: CreativeRequest = {
      platform: catalogEntry.platform,
      creativeType: catalogEntry.creativeType,
      campaign: brief.campaignId ?? "quick-create",
      brand: { name: brand.brandName, logo: logoUrl, colors: paletteColors, fonts: [] },
      audience: brief.audienceName,
      visualStyle: brief.visualStyleOverride || (brief.strictBrandRules ? "corporate" : toneToVisualStyle(brief.tone)),
      colorPalette: paletteColors,
      message: brief.objective,
      cta: brief.cta,
      includeLogo: true,
      includeBrandColors: true,
    };

    const creativeResult = CreativeEngine.generate(creativeRequest);
    const knowledge = CreativeTypeService.get(catalogEntry.creativeType);

    let variations: CreativeVariation[];
    const platformVersions: PlatformVersion[] = [];

    if (catalogEntry.assetSetSize && catalogEntry.assetSetSize > 1) {
      // Google PMax-style asset set: one real image per required aspect ratio, not stylistic variants.
      const ratioDimensions = PlatformKnowledgeService.getDimensions(catalogEntry.platform).slice(0, catalogEntry.assetSetSize);
      const responses = await Promise.all(
        ratioDimensions.map(dims => mediaPlatformAPI.generateImage(buildMediaRequest(creativeResult, brand.brandName, paletteColors, { width: dims.width, height: dims.height })))
      );
      variations = responses.map((r, i) => ({ id: `var-${i}`, imageUrl: r.assetUrl, layoutLabel: `${ratioDimensions[i].width}×${ratioDimensions[i].height}` }));
      for (let i = 1; i < responses.length; i++) {
        platformVersions.push({ platform: `${catalogEntry.platform} (${ratioDimensions[i].width}x${ratioDimensions[i].height})`, imageUrl: responses[i].assetUrl });
      }
    } else {
      const count = Math.min(Math.max(variationCount, 1), LAYOUT_VARIATIONS.length);
      const results = await Promise.all(
        Array.from({ length: count }, (_, i) => {
          const layout = LAYOUT_VARIATIONS[i];
          const request = buildMediaRequest(creativeResult, brand.brandName, paletteColors, undefined, brief.negativePromptExtra);
          request.prompt = `${request.prompt}. ${layout.directive}`;
          return mediaPlatformAPI.generateImage(request).then(r => ({ id: `var-${i}`, imageUrl: r.assetUrl, layoutLabel: layout.label }));
        })
      );
      variations = results;

      const otherPlatforms = knowledge.compatiblePlatforms.filter(p => p !== catalogEntry.platform).slice(0, 2);
      for (const platform of otherPlatforms) {
        const dims = PlatformKnowledgeService.getDimensions(platform)[0];
        const response = await mediaPlatformAPI.generateImage(buildMediaRequest(creativeResult, brand.brandName, paletteColors, { width: dims.width || 1080, height: dims.height || 1080 }));
        platformVersions.push({ platform, imageUrl: response.assetUrl });
      }
    }

    const entry: GenerationHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "creative",
      outputId,
      outputLabel: catalogEntry.label,
      createdAt: new Date().toISOString(),
      organizationId,
      brief,
      primaryImageUrl: variations[0]?.imageUrl,
      variantImageUrls: variations.slice(1).map(v => v.imageUrl),
      variations,
      hiddenPrompt: creativeResult.prompt.prompt,
      platformVersions,
    };
    this.history.push(entry);
    return entry;
  }

  /**
   * Creative Design Studio's post-generation natural-language editing ("Make the headline
   * larger", "Move logo to the top") — this is regeneration, not pixel-level inpainting: the
   * exact stored `hiddenPrompt` plus the same layout directive that produced this variation is
   * re-sent to the real image model with the user's instruction appended as an explicit change
   * request. Disclosed deliberately as regeneration-based editing, not true masked inpainting,
   * which no provider wired into this platform supports today.
   */
  async regenerateVariation(entryId: string, variationIndex: number, instruction: string): Promise<GenerationHistoryEntry> {
    const entry = this.getHistoryEntry(entryId);
    if (!entry || entry.kind !== "creative" || !entry.variations || !entry.hiddenPrompt) throw new Error("Creative history entry not found or has no editable variations");
    const target = entry.variations[variationIndex];
    if (!target) throw new Error("Variation not found");

    const catalogEntry = OutputCatalogRegistry.getCreative(entry.outputId as CreativeOutputKind);
    if (!catalogEntry) throw new Error("Unknown creative output");
    const dims = PlatformKnowledgeService.getDimensions(catalogEntry.platform)[0];
    const { brand, colors } = this.resolveBrand(entry.brief);
    const paletteColors = colors.length > 0 ? colors : ["#4F46E5", "#7C3AED"];
    const layout = LAYOUT_VARIATIONS.find(l => l.label === target.layoutLabel);
    const prompt = `${entry.hiddenPrompt}. ${layout?.directive ?? ""} Apply this specific change requested by the user: "${instruction}".`;

    const response = await mediaPlatformAPI.generateImage({
      provider: "openai-image",
      action: "generate",
      mediaType: "image",
      prompt,
      dimensions: { width: dims?.width || 1080, height: dims?.height || 1080 },
      quality: "standard",
      style: "modern",
      outputFormat: "png",
      brand: { name: brand.brandName, colors: paletteColors, voice: "" },
      platform: catalogEntry.platform,
      creativeType: catalogEntry.creativeType,
      campaign: entry.brief.campaignId ?? "quick-create",
    });

    entry.variations[variationIndex] = { ...target, imageUrl: response.assetUrl, regenerated: true, qualityScore: undefined, qualityIssues: undefined };
    entry.primaryImageUrl = entry.variations[0]?.imageUrl;
    entry.variantImageUrls = entry.variations.slice(1).map(v => v.imageUrl);
    return entry;
  }

  /** Attaches a real vision-model quality-control result to one variation — called after `generateCreative`, never during it, so a slow/failed QC pass never blocks delivering the images themselves. */
  recordVariationQuality(entryId: string, variationIndex: number, score: number, issues: string[]): void {
    const variation = this.getHistoryEntry(entryId)?.variations?.[variationIndex];
    if (variation) {
      variation.qualityScore = score;
      variation.qualityIssues = issues;
    }
  }

  async applyContentAction(entryId: string, action: ContentAction): Promise<GenerationHistoryEntry> {
    const entry = this.getHistoryEntry(entryId);
    if (!entry || entry.kind !== "content") throw new Error("Content history entry not found");
    const base = entry.primaryText ?? "";

    switch (action) {
      case "rewrite": {
        const catalogEntry = OutputCatalogRegistry.getContent(entry.outputId as ContentOutputKind);
        if (catalogEntry) {
          const request = this.buildGenerationRequest(entry.brief, catalogEntry, { creativity: "creative" });
          const result = await GenerationEngine.generate(request);
          entry.primaryText = result.content;
        }
        break;
      }
      case "shorten":
        entry.primaryText = deriveShortText(base);
        break;
      case "expand":
        entry.primaryText = deriveLongText(base, entry.brief);
        break;
      case "translate":
        entry.primaryText = translateDeterministic(base, entry.brief.language && entry.brief.language !== "English" ? entry.brief.language : "Spanish");
        break;
      case "improve-readability":
      case "improve-engagement":
      case "improve-seo": {
        const analysis = ContentIntelligenceEngine.analyze(entry.outputLabel, base);
        entry.primaryText = analysis.optimizedSample;
        break;
      }
    }
    return entry;
  }

  localizeEntry(entryId: string, language: string): GenerationHistoryEntry {
    const entry = this.getHistoryEntry(entryId);
    if (!entry) throw new Error("History entry not found");
    const localized: LocalizedVersion =
      entry.kind === "content"
        ? { language, text: translateDeterministic(entry.primaryText ?? "", language) }
        : { language, imageUrl: entry.primaryImageUrl, text: `Localized copy for ${language} — a deterministic placeholder prepared for a future real localization pipeline.` };
    entry.localizedVersions = [...(entry.localizedVersions ?? []).filter(l => l.language !== language), localized];
    return entry;
  }

  markSaved(entryId: string, assetId: string): void {
    const entry = this.getHistoryEntry(entryId);
    if (entry) entry.savedAssetId = assetId;
  }

  markSubmitted(entryId: string, workflowEntryId: string): void {
    const entry = this.getHistoryEntry(entryId);
    if (entry) entry.workflowEntryId = workflowEntryId;
  }
}

export const contentOrchestrationEngine = new ContentOrchestrationEngineImpl();
export { ContentOrchestrationEngineImpl };
