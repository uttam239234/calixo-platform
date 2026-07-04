/** Calixo Platform — Media Prompt Optimizer */
import type { MediaRequest } from "./types";
import { BrandKitEngine } from "@/core/brand/BrandKitEngine";
import { PlatformKnowledgeService } from "@/core/creative/PlatformKnowledgeService";

export const MediaPromptOptimizer = {
  optimize(request: MediaRequest): string {
    let prompt = request.prompt;

    // Inject brand context
    if (request.brand?.name) {
      const brand = BrandKitEngine.getBrand("brand-calixo"); // fallback
      if (brand) {
        prompt += `, brand: ${request.brand.name}, brand colors: ${request.brand.colors.slice(0, 2).join(" and ")}, brand voice: ${request.brand.voice}`;
      }
    }

    // Inject platform context
    if (request.platform) {
      try {
        const pk = PlatformKnowledgeService.get(request.platform as never);
        prompt += `, platform: ${pk.displayName}, dimensions: ${request.dimensions.width}x${request.dimensions.height}, best practices: ${pk.bestPractices.slice(0, 2).join("; ")}`;
      } catch { /* platform not found */ }
    }

    // Quality boosters
    prompt += `, high resolution, professional quality, commercial use, ${request.style} style, ${request.quality} quality`;

    return prompt;
  },
};