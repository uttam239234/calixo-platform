/**
 * Calixo Platform — Design System Engine
 *
 * Provides enterprise design system rules: spacing, margins, grid,
 * typography scale, colour priority, logo rules, contrast rules,
 * whitespace rules, and visual balance guidelines.
 */

import type { DesignSystemRules } from "./types";

const DESIGN_SYSTEM: DesignSystemRules = {
  spacing: { unit: 8, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  margins: { top: 24, bottom: 24, left: 24, right: 24 },
  padding: { xs: 8, sm: 16, md: 24, lg: 40 },
  grid: { columns: 12, gutter: 24, margin: 24, maxWidth: 1440 },
  typography: {
    scale: {
      "display-xl": { size: "72px", lineHeight: "1.1", weight: 800 },
      "display-lg": { size: "56px", lineHeight: "1.15", weight: 700 },
      "display-md": { size: "48px", lineHeight: "1.2", weight: 700 },
      "h1": { size: "40px", lineHeight: "1.25", weight: 700 },
      "h2": { size: "32px", lineHeight: "1.3", weight: 600 },
      "h3": { size: "24px", lineHeight: "1.35", weight: 600 },
      "h4": { size: "20px", lineHeight: "1.4", weight: 600 },
      "body-lg": { size: "18px", lineHeight: "1.5", weight: 400 },
      "body-md": { size: "16px", lineHeight: "1.5", weight: 400 },
      "body-sm": { size: "14px", lineHeight: "1.5", weight: 400 },
      "caption": { size: "12px", lineHeight: "1.4", weight: 400 },
      "label": { size: "11px", lineHeight: "1.3", weight: 600 },
    },
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
  },
  colorPriority: ["primary", "secondary", "accent", "background", "surface", "text-primary", "text-secondary"],
  logoRules: { minSize: 48, clearSpace: 16, allowedPositions: ["top-left", "top-center", "top-right", "bottom-left", "bottom-right"] },
  contrastRules: { minRatio: 4.5, textOnImage: "Use semi-transparent overlay (15-30% black) behind text on images to ensure readability" },
  whitespaceRules: { minPadding: 16, elementSpacing: 12, sectionSpacing: 32 },
  visualBalance: { ruleOfThirds: true, focalPoint: "Primary focal point should align with upper-left or upper-right third intersection", weightDistribution: "Distribute visual weight evenly — avoid clustering elements in one area" },
};

export const DesignSystemEngine = {
  get(): DesignSystemRules {
    return { ...DESIGN_SYSTEM };
  },

  spacing(preset: keyof DesignSystemRules["spacing"]): number {
    return DESIGN_SYSTEM.spacing[preset];
  },

  typographyScale(level: string) {
    return DESIGN_SYSTEM.typography.scale[level] ?? DESIGN_SYSTEM.typography.scale["body-md"];
  },

  getColorPriority(): string[] {
    return [...DESIGN_SYSTEM.colorPriority];
  },

  getLogoRules() {
    return { ...DESIGN_SYSTEM.logoRules };
  },

  getContrastRules() {
    return { ...DESIGN_SYSTEM.contrastRules };
  },

  getWhitespaceRules() {
    return { ...DESIGN_SYSTEM.whitespaceRules };
  },

  getGrid() {
    return { ...DESIGN_SYSTEM.grid };
  },
};