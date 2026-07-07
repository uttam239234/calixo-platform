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
