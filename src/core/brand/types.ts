/** Calixo Platform — Brand Kit Types */

export interface BrandProfile {
  id: string; organizationName: string; brandName: string; shortName: string;
  description: string; mission: string; vision: string; tagline: string;
  website: string; industry: string; businessType: string; timezone: string; defaultLanguage: string;
}

export interface LogoSet {
  primary: string; secondary: string; monochrome: string; dark: string; light: string;
  favicon: string; minSize: number; clearSpace: number; usageRules: string[];
}

export interface BrandColor { name: string; hex: string; rgb: string; hsl: string; }

export interface ColorSystem {
  primary: BrandColor; secondary: BrandColor; accent: BrandColor; neutral: BrandColor;
  success: BrandColor; warning: BrandColor; danger: BrandColor;
  background: BrandColor; surface: BrandColor; text: BrandColor; border: BrandColor;
}

export interface TypographySystem {
  headingFont: string; bodyFont: string; displayFont: string; fallbackFonts: string[];
  fontWeights: Record<string, number>;
  typeScale: Record<string, { size: string; lineHeight: string; letterSpacing: string }>;
}

export interface BrandVoice {
  tone: string; writingStyle: string; communicationStyle: string;
  preferredVocabulary: string[]; forbiddenWords: string[]; ctaStyle: string;
  grammarRules: string[]; capitalizationRules: string; emojiUsage: string;
}

export interface VisualGuidelines {
  photographyStyle: string; illustrationStyle: string; iconStyle: string;
  imageStyle: string; layoutStyle: string; spacingStyle: string;
  cornerRadius: string; shadowStyle: string; animationStyle: string;
}

export interface PlatformOverride {
  platform: string; colors?: Partial<ColorSystem>; typography?: Partial<TypographySystem>;
  cta?: string; logo?: string; tone?: string; dimensions?: { width: number; height: number };
}

export interface AISettings {
  preferredModel: string; creativity: number; brandStrictness: number;
  complianceStrictness: number; seoStrictness: number; temperature: number;
  preferredImageStyle: string; preferredCreativeStyle: string;
}

export interface BrandAsset {
  id: string; name: string; type: "logo" | "icon" | "illustration" | "background" | "pattern" | "image" | "video" | "document";
  url: string; format: string; size: string; uploadedAt: string; tags: string[];
}

export interface BrandKit {
  id: string; profile: BrandProfile; logos: LogoSet; colors: ColorSystem;
  typography: TypographySystem; voice: BrandVoice; visualGuidelines: VisualGuidelines;
  platformOverrides: PlatformOverride[]; aiSettings: AISettings;
  assets: BrandAsset[];
}

export interface ValidationResult {
  category: string; passed: boolean; score: number; issues: string[];
}

export interface BrandValidation {
  overallScore: number; completeness: number; results: ValidationResult[];
}

export interface ExportOptions { format: "json" | "bundle" | "creative-presets" | "ai-config" | "design-tokens"; }