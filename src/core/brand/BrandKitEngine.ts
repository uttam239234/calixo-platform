/** Calixo Platform — Brand Kit Engine (Main orchestrator) */
import type { BrandKit, BrandValidation, BrandProfile, ColorSystem, PlatformOverride, ExportOptions } from "./types";
import { MOCK_BRANDS } from "./mock-brands";
import { BrandValidationService } from "./BrandValidationService";
import { BrandExportService } from "./BrandExportService";

const brands = new Map<string, BrandKit>(MOCK_BRANDS.map(b => [b.id, b]));

export const BrandKitEngine = {
  getBrand(id: string): BrandKit | undefined { return brands.get(id) ? { ...brands.get(id)! } : undefined; },
  getAllBrands(): BrandKit[] { return Array.from(brands.values()).map(b => ({ ...b })); },
  getProfile(id: string): BrandProfile | undefined { const b = brands.get(id); return b ? { ...b.profile } : undefined; },
  getColors(id: string): ColorSystem | undefined { const b = brands.get(id); return b ? { ...b.colors } : undefined; },
  getPlatformOverride(brandId: string, platform: string): PlatformOverride | undefined {
    return brands.get(brandId)?.platformOverrides.find(o => o.platform === platform);
  },
  validate(id: string): BrandValidation { const b = brands.get(id); if (!b) return { overallScore: 0, completeness: 0, results: [] }; return BrandValidationService.validate(b); },
  export(id: string, options: ExportOptions): string { const b = brands.get(id); if (!b) return "{}"; return BrandExportService.export(b, options); },
};