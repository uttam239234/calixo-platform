/** Calixo Platform - Shared Brand Platform Contract. Every module should read `BrandSummary` via `BrandPlatformAPI`, never `BrandKitEngine` directly. */
export interface BrandSummary {
  id: string;
  brandName: string;
  organizationId?: string;
  workspaceId?: string;
  industry: string;
  assetCount: number;
  validationScore: number;
}

/** The colors/voice/logo slice of a `BrandKit` that generation modules (Content Studio) need for a "brand style" auto-fill — not exposed by `BrandSummary`. */
export interface BrandStyleProfile {
  id: string;
  brandName: string;
  colors: string[];
  voiceTone: string;
  writingStyle: string;
  preferredCTA: string;
  forbiddenWords: string[];
  preferredWords: string[];
  logoUrl?: string;
}
