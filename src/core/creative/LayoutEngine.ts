/**
 * Calixo Platform — Layout Engine
 *
 * Generates structured layout blueprints for any creative type + platform combination.
 * Does NOT generate images — generates layout definitions.
 */

import type { CreativeType, CreativePlatform, LayoutBlueprint, LayoutSection, PlatformDimensions } from "./types";
import { CreativeTypeService } from "./CreativeTypeService";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";

export const LayoutEngine = {
  /**
   * Generate a layout blueprint for a creative type on a specific platform.
   */
  generate(creativeType: CreativeType, platform: CreativePlatform): LayoutBlueprint {
    const creative = CreativeTypeService.get(creativeType);
    const platformKnowledge = PlatformKnowledgeService.get(platform);

    // Get the primary dimensions for this platform
    const dimensions: PlatformDimensions = platformKnowledge.recommendedDimensions[0];

    // Clone and adapt the layout sections
    const sections: LayoutSection[] = creative.recommendedStructure.map((section) => ({
      ...section,
      elements: section.elements.map((el) => ({
        ...el,
        position: { ...el.position },
      })),
    }));

    // Apply platform-specific adaptations
    this.adaptForPlatform(sections, platform, platformKnowledge.safeAreas);

    return {
      creativeType,
      platform,
      dimensions: { ...dimensions },
      sections,
    };
  },

  /**
   * Adapt layout sections to platform constraints (safe areas, etc).
   */
  adaptForPlatform(sections: LayoutSection[], platform: CreativePlatform, safeAreas: { top: number; bottom: number; left: number; right: number }) {
    if (platform === "instagram" || platform === "meta-ads") {
      // Instagram/Meta stories: keep content away from UI overlay zones
      for (const section of sections) {
        for (const el of section.elements) {
          if (el.position.y.includes("%")) {
            const y = parseInt(el.position.y);
            if (y < 15) el.position.y = `${Math.max(y, 12)}%`;
            if (y > 80) el.position.y = `${Math.min(y, 78)}%`;
          }
        }
      }
    }

    if (platform === "youtube") {
      // YouTube thumbnails: avoid bottom-right (timestamp)
      for (const section of sections) {
        for (const el of section.elements) {
          if (el.position.x.includes("%") && parseInt(el.position.x) > 75 && parseInt(el.position.y) > 75) {
            el.position.x = `${Math.min(parseInt(el.position.x), 70)}%`;
          }
        }
      }
    }
  },

  /**
   * Generate a layout for Instagram Carousel (5-slide template).
   */
  generateInstagramCarousel(): LayoutBlueprint {
    return this.generate("carousel", "instagram");
  },

  /**
   * Generate a layout for Google Display Banner.
   */
  generateDisplayBanner(): LayoutBlueprint {
    return this.generate("display-banner", "google-display");
  },

  /**
   * Generate a layout for YouTube Thumbnail.
   */
  generateYouTubeThumbnail(): LayoutBlueprint {
    return this.generate("thumbnail", "youtube");
  },

  /**
   * Generate a layout for Landing Page Hero.
   */
  generateLandingHero(): LayoutBlueprint {
    return this.generate("landing-hero", "blog");
  },
};