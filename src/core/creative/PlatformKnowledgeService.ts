/**
 * Calixo Platform — Platform Knowledge Service
 *
 * Knowledge base for every creative platform.
 * Stores dimensions, safe areas, character limits, ratios, CTA positions,
 * text density, brand placement, font sizes, best practices, and accessibility rules.
 */

import type { CreativePlatform, PlatformKnowledge } from "./types";

const PLATFORM_KNOWLEDGE: Record<CreativePlatform, PlatformKnowledge> = {
  facebook: {
    platform: "facebook", displayName: "Facebook",
    recommendedDimensions: [
      { width: 1200, height: 630, unit: "px" },
      { width: 1080, height: 1080, unit: "px" },
      { width: 1080, height: 1350, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0, unit: "px" },
    characterLimits: { headline: 40, body: 63206, cta: 25 },
    imageRatio: "1.91:1 or 1:1", videoRatio: "16:9 or 1:1",
    ctaPosition: "bottom-center", textDensity: "low",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "32-40px", subheadline: "20-24px", body: "14-16px", cta: "16-18px" },
    bestPractices: [
      "Use high-contrast, eye-catching visuals",
      "Avoid more than 20% text overlay on images",
      "Use Facebook-native CTA buttons for ads",
      "Video performs 2x better than static images",
      "Keep primary message in the centre safe zone",
    ],
    accessibilityRules: [
      "Ensure text contrast ratio of at least 4.5:1",
      "Add alt text descriptions to all images",
      "Avoid flashing/strobing content",
      "Use readable font sizes on all devices",
    ],
  },
  instagram: {
    platform: "instagram", displayName: "Instagram",
    recommendedDimensions: [
      { width: 1080, height: 1080, unit: "px" },
      { width: 1080, height: 1350, unit: "px" },
      { width: 1080, height: 1920, unit: "px" },
    ],
    safeAreas: { top: 150, bottom: 150, left: 20, right: 20, unit: "px" },
    characterLimits: { headline: 50, body: 2200, cta: 30 },
    imageRatio: "1:1, 4:5, or 9:16", videoRatio: "9:16 (Reels)",
    ctaPosition: "bottom-center", textDensity: "minimal",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "28-36px", subheadline: "18-22px", body: "13-15px", cta: "14-16px" },
    bestPractices: [
      "Visual-first design — text should be minimal",
      "Reels cover photo: 1080x1920px with centre focal point",
      "Carousel cards should maintain consistent branding across slides",
      "Use Instagram's native text tools for Stories",
      "Avoid placing critical elements in top/bottom 150px (UI overlay zone)",
    ],
    accessibilityRules: [
      "Add alt text via Instagram's accessibility settings",
      "Use auto-captioning for video content",
      "Ensure sufficient contrast for text overlays",
      "Avoid rapid flashing animations in Stories",
    ],
  },
  linkedin: {
    platform: "linkedin", displayName: "LinkedIn",
    recommendedDimensions: [
      { width: 1200, height: 627, unit: "px" },
      { width: 1080, height: 1080, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 30, right: 30, unit: "px" },
    characterLimits: { headline: 70, body: 3000, cta: 30 },
    imageRatio: "1.91:1", videoRatio: "16:9",
    ctaPosition: "bottom-left", textDensity: "medium",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "28-36px", subheadline: "18-24px", body: "14-16px", cta: "15-17px" },
    bestPractices: [
      "Professional, clean design with ample whitespace",
      "Document/PDF carousel posts perform best",
      "Use brand colours consistently but avoid overly bright palettes",
      "Include data visualizations and charts for credibility",
      "Keep text professional — avoid excessive emojis",
    ],
    accessibilityRules: [
      "Ensure text is readable at thumbnail size",
      "Use semantic hierarchy in document posts",
      "Alt text for all images",
      "High contrast for data visualizations",
    ],
  },
  x: {
    platform: "x", displayName: "X (Twitter)",
    recommendedDimensions: [
      { width: 1600, height: 900, unit: "px" },
      { width: 1200, height: 675, unit: "px" },
      { width: 1080, height: 1080, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0, unit: "px" },
    characterLimits: { headline: 50, body: 280, cta: 20 },
    imageRatio: "16:9 or 1:1", videoRatio: "16:9",
    ctaPosition: "bottom-center", textDensity: "minimal",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "24-32px", subheadline: "16-20px", body: "14px", cta: "14-16px" },
    bestPractices: [
      "Image should be strong enough to stand alone without text",
      "If using text overlay, keep under 15 words",
      "Dark mode friendly — test on both light and dark backgrounds",
      "GIFs and short video clips perform well",
    ],
    accessibilityRules: [
      "Add descriptive alt text (up to 1000 characters)",
      "Ensure video content has captions",
      "Avoid text-heavy images — use alt text instead",
    ],
  },
  "google-search": {
    platform: "google-search", displayName: "Google Search Ads",
    recommendedDimensions: [
      { width: 0, height: 0, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0, unit: "px" },
    characterLimits: { headline: 30, body: 90, cta: 15 },
    imageRatio: "N/A (text-only ads)", videoRatio: "N/A",
    ctaPosition: "bottom-right", textDensity: "high",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "N/A", subheadline: "N/A", body: "N/A", cta: "N/A" },
    bestPractices: [
      "Character limits are strict — every character must earn its place",
      "Include target keyword in Headline 1",
      "Use ad extensions for additional information",
      "A/B test ad copy variations",
    ],
    accessibilityRules: [
      "N/A for text ads — ensure landing page is accessible",
      "Use clear, descriptive link text",
    ],
  },
  "google-display": {
    platform: "google-display", displayName: "Google Display Ads",
    recommendedDimensions: [
      { width: 300, height: 250, unit: "px" },
      { width: 728, height: 90, unit: "px" },
      { width: 160, height: 600, unit: "px" },
      { width: 300, height: 600, unit: "px" },
      { width: 970, height: 250, unit: "px" },
    ],
    safeAreas: { top: 5, bottom: 5, left: 5, right: 5, unit: "px" },
    characterLimits: { headline: 25, body: 90, cta: 15 },
    imageRatio: "Multiple responsive sizes", videoRatio: "16:9",
    ctaPosition: "bottom-right", textDensity: "low",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "16-20px", subheadline: "12-14px", body: "10-12px", cta: "12-14px" },
    bestPractices: [
      "Keep text under 20% of image (Google policy)",
      "Use high-quality images with minimal text overlay",
      "Design for all sizes — responsive layouts work best",
      "Include clear branding and a visible CTA button",
    ],
    accessibilityRules: [
      "Text must be readable at all banner sizes",
      "Use sufficient colour contrast",
      "Avoid tiny text that becomes illegible on small banners",
    ],
  },
  "performance-max": {
    platform: "performance-max", displayName: "Performance Max",
    recommendedDimensions: [
      { width: 1200, height: 628, unit: "px" },
      { width: 1200, height: 1200, unit: "px" },
      { width: 960, height: 1200, unit: "px" },
    ],
    safeAreas: { top: 10, bottom: 10, left: 10, right: 10, unit: "px" },
    characterLimits: { headline: 30, body: 90, cta: 15 },
    imageRatio: "1.91:1, 1:1, 4:5", videoRatio: "16:9 or 9:16",
    ctaPosition: "bottom-center", textDensity: "medium",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "24-32px", subheadline: "16-20px", body: "13-15px", cta: "15-17px" },
    bestPractices: [
      "Provide maximum asset variety for Google's AI to optimize",
      "Upload all three aspect ratios for maximum reach",
      "Include at least one video (10-30 seconds)",
      "Add audience signals to guide Google's AI",
    ],
    accessibilityRules: [
      "Ensure all text is readable across device sizes",
      "Video content must have captions",
      "Use clear visual hierarchy",
    ],
  },
  "meta-ads": {
    platform: "meta-ads", displayName: "Meta Ads",
    recommendedDimensions: [
      { width: 1080, height: 1080, unit: "px" },
      { width: 1080, height: 1920, unit: "px" },
    ],
    safeAreas: { top: 100, bottom: 100, left: 20, right: 20, unit: "px" },
    characterLimits: { headline: 40, body: 125, cta: 25 },
    imageRatio: "1:1 or 9:16", videoRatio: "9:16 or 1:1",
    ctaPosition: "bottom-center", textDensity: "low",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "28-36px", subheadline: "18-22px", body: "13-15px", cta: "15-17px" },
    bestPractices: [
      "Use the 20% text rule for feed ads",
      "Story ads: keep key content in the centre safe zone",
      "Carousel ads: first card is the hook — make it count",
      "Use bright, high-contrast colours for thumb-stop power",
    ],
    accessibilityRules: [
      "Add alt text for all ad images",
      "Use captions for video ads",
      "Ensure text contrast meets WCAG AA standards",
    ],
  },
  youtube: {
    platform: "youtube", displayName: "YouTube",
    recommendedDimensions: [
      { width: 1280, height: 720, unit: "px" },
      { width: 1920, height: 1080, unit: "px" },
    ],
    safeAreas: { top: 50, bottom: 50, left: 50, right: 50, unit: "px" },
    characterLimits: { headline: 100, body: 5000, cta: 30 },
    imageRatio: "16:9", videoRatio: "16:9",
    ctaPosition: "bottom-right", textDensity: "medium",
    brandPlacement: "bottom-right",
    recommendedFontSizes: { headline: "40-56px", subheadline: "24-32px", body: "16-20px", cta: "18-22px" },
    bestPractices: [
      "Thumbnails should be high-contrast with a clear focal point",
      "Use faces with strong expressions for higher CTR",
      "Keep text on thumbnails under 6 words",
      "Use consistent thumbnail branding for channel recognition",
      "Safe area: keep critical elements away from bottom-right (timestamp)",
    ],
    accessibilityRules: [
      "Add closed captions to all videos",
      "Use high-contrast thumbnail design",
      "Avoid flashing imagery in thumbnails",
    ],
  },
  whatsapp: {
    platform: "whatsapp", displayName: "WhatsApp",
    recommendedDimensions: [
      { width: 800, height: 800, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0, unit: "px" },
    characterLimits: { headline: 50, body: 1024, cta: 30 },
    imageRatio: "1:1", videoRatio: "N/A",
    ctaPosition: "bottom-center", textDensity: "minimal",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "24-32px", subheadline: "16-20px", body: "13-15px", cta: "14-16px" },
    bestPractices: [
      "Keep designs simple and direct — mobile-first viewing",
      "Use bold, legible typography for small screens",
      "Brand recognition should be immediate",
    ],
    accessibilityRules: [
      "Ensure text is readable on mobile screens",
      "Use sufficient contrast for all text",
    ],
  },
  email: {
    platform: "email", displayName: "Email",
    recommendedDimensions: [
      { width: 600, height: 200, unit: "px" },
      { width: 600, height: 400, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 20, right: 20, unit: "px" },
    characterLimits: { headline: 50, body: 0, cta: 30 },
    imageRatio: "600px wide (standard)", videoRatio: "N/A (use animated GIF)",
    ctaPosition: "center", textDensity: "medium",
    brandPlacement: "top-center",
    recommendedFontSizes: { headline: "24-30px", subheadline: "16-20px", body: "14-16px", cta: "16-18px" },
    bestPractices: [
      "Design for 600px max width (standard email client width)",
      "Use web-safe fonts or embed custom fonts",
      "CTA buttons should be at least 44x44px for mobile touch targets",
      "Keep email header under 200px for above-fold content",
      "Test across Gmail, Outlook, Apple Mail",
    ],
    accessibilityRules: [
      "Use semantic HTML table structure",
      "Add alt text to all images",
      "Ensure 4.5:1 contrast ratio for text",
      "CTA buttons must have sufficient touch target size",
    ],
  },
  blog: {
    platform: "blog", displayName: "Blog",
    recommendedDimensions: [
      { width: 1200, height: 630, unit: "px" },
      { width: 1920, height: 600, unit: "px" },
      { width: 800, height: 500, unit: "px" },
    ],
    safeAreas: { top: 0, bottom: 0, left: 0, right: 0, unit: "px" },
    characterLimits: { headline: 70, body: 0, cta: 30 },
    imageRatio: "2:1 or 16:9", videoRatio: "16:9",
    ctaPosition: "bottom-left", textDensity: "high",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "36-48px", subheadline: "20-28px", body: "16-18px", cta: "16-18px" },
    bestPractices: [
      "Featured image should be 1200x630px for Open Graph sharing",
      "Use text overlay sparingly — let the image communicate",
      "Include brand element but don't overpower the visual",
      "Optimize for both light and dark mode readers",
    ],
    accessibilityRules: [
      "Use descriptive alt text for featured images",
      "Ensure any text overlay has high contrast",
      "Test featured image readability at thumbnail size",
    ],
  },
  print: {
    platform: "print", displayName: "Print",
    recommendedDimensions: [
      { width: 210, height: 297, unit: "mm" },
      { width: 297, height: 420, unit: "mm" },
      { width: 148, height: 210, unit: "mm" },
    ],
    safeAreas: { top: 5, bottom: 5, left: 5, right: 5, unit: "mm" },
    characterLimits: { headline: 50, body: 0, cta: 30 },
    imageRatio: "Various (A-series standard)", videoRatio: "N/A",
    ctaPosition: "bottom-center", textDensity: "medium",
    brandPlacement: "top-left",
    recommendedFontSizes: { headline: "36-72pt", subheadline: "18-28pt", body: "10-14pt", cta: "14-18pt" },
    bestPractices: [
      "Use CMYK colour profile for print",
      "300 DPI minimum for all images",
      "Include 3-5mm bleed area around all edges",
      "Use vector graphics where possible for scalability",
      "Test colours with printer proof before mass production",
    ],
    accessibilityRules: [
      "Minimum 12pt font size for body text",
      "High contrast between text and background",
      "Clear visual hierarchy for readability at distance",
      "Braille/QR code options for accessible versions",
    ],
  },
};

export const PlatformKnowledgeService = {
  get(platform: CreativePlatform): PlatformKnowledge {
    return { ...PLATFORM_KNOWLEDGE[platform] };
  },
  getAll(): PlatformKnowledge[] {
    return Object.values(PLATFORM_KNOWLEDGE).map(k => ({ ...k }));
  },
  getDimensions(platform: CreativePlatform) {
    return [...PLATFORM_KNOWLEDGE[platform].recommendedDimensions];
  },
  getBestPractices(platform: CreativePlatform): string[] {
    return [...PLATFORM_KNOWLEDGE[platform].bestPractices];
  },
  getAccessibilityRules(platform: CreativePlatform): string[] {
    return [...PLATFORM_KNOWLEDGE[platform].accessibilityRules];
  },
  getAllPlatforms(): CreativePlatform[] {
    return Object.keys(PLATFORM_KNOWLEDGE) as CreativePlatform[];
  },
};