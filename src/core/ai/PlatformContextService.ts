/**
 * Calixo Platform — Platform Context Service
 *
 * Provides platform-specific constraints and best practices for
 * each supported content platform. Used by GenerationEngine to
 * adapt output to platform requirements.
 */

import type { Platform, PlatformConstraints } from "./types";

const PLATFORM_CONSTRAINTS: Record<Platform, PlatformConstraints> = {
  facebook: {
    platform: "facebook",
    displayName: "Facebook",
    characterLimit: 63206,
    imageRatio: "1.91:1 (landscape) or 1:1 (square)",
    recommendedTone: "Conversational, community-driven, authentic",
    ctaRules: "Avoid overly salesy CTAs. Focus on engagement (Like, Comment, Share). Use Facebook-native CTA buttons for ads.",
    seoRequirements: "Minimal on-platform SEO. Focus on engagement signals and shareability.",
    bestPractices: [
      "Use eye-catching visuals (video performs 2x better than static images)",
      "Keep text short — posts under 80 characters get 66% higher engagement",
      "Post during peak hours: Wed-Fri, 9am-1pm local time",
      "Use Facebook Pixel for retargeting audiences",
      "Leverage Facebook Groups for community building",
    ],
  },
  instagram: {
    platform: "instagram",
    displayName: "Instagram",
    characterLimit: 2200,
    imageRatio: "1:1 (square), 4:5 (portrait), or 1.91:1 (landscape)",
    recommendedTone: "Visual-first, aspirational, casual with emojis",
    ctaRules: "Use 'Link in bio' pattern. Story CTAs via swipe-up (10K+ followers). Shopping tags for products.",
    seoRequirements: "Instagram SEO via alt text, captions with keywords, and hashtag strategy (up to 30 hashtags).",
    bestPractices: [
      "Use 5-10 relevant hashtags (mix of broad and niche)",
      "Carousel posts get 3x more engagement than single images",
      "Post Reels for maximum organic reach",
      "Use Instagram Shopping tags for product posts",
      "Stories should be used for behind-the-scenes and time-sensitive content",
    ],
  },
  linkedin: {
    platform: "linkedin",
    displayName: "LinkedIn",
    characterLimit: 3000,
    imageRatio: "1.91:1 (landscape) recommended",
    recommendedTone: "Professional, thought-leadership, insightful",
    ctaRules: "Soft CTAs preferred — 'Learn more', 'Read the full article'. Document posts (PDF carousels) perform exceptionally well.",
    seoRequirements: "LinkedIn articles index on Google. Include target keywords in headline and first paragraph. Profile SEO matters.",
    bestPractices: [
      "Personal stories and lessons learned get the highest engagement",
      "Use line breaks between paragraphs (every 1-2 sentences)",
      "Document/PDF carousel posts are the #1 performing format",
      "Engage with comments within the first hour to boost reach",
      "Tag relevant people/companies (max 5-10 to avoid spam filters)",
    ],
  },
  "google-ads": {
    platform: "google-ads",
    displayName: "Google Search Ads",
    characterLimit: 90,
    imageRatio: "N/A (text ads)",
    recommendedTone: "Direct, benefit-driven, action-oriented",
    ctaRules: "Strong, clear CTA required. Include keywords in headlines. Use ad extensions (sitelinks, callouts, structured snippets).",
    seoRequirements: "Quality Score optimization. Keyword relevance to ad copy is critical. Landing page experience matters.",
    bestPractices: [
      "Include target keyword in Headline 1",
      "Write at least 3 headlines and 2 descriptions per ad",
      "Use countdown timers and location insertion for dynamic relevance",
      "Ad strength should be 'Good' or 'Excellent'",
      "A/B test at least 2-3 ad variations per ad group",
    ],
  },
  "google-display": {
    platform: "google-display",
    displayName: "Google Display Ads",
    characterLimit: 90,
    imageRatio: "1.91:1 (landscape), 1:1 (square), or responsive sizes",
    recommendedTone: "Visual-led, brand awareness focused, concise",
    ctaRules: "CTA should be visually prominent. Use responsive display ads for maximum reach. Leverage audience targeting.",
    seoRequirements: "Limited. Focus on audience targeting and placement optimization.",
    bestPractices: [
      "Use high-quality images with minimal text overlay (Google's 20% text rule)",
      "Create responsive ads that adapt to all placements",
      "Use custom intent audiences for higher relevance",
      "Include your logo and brand colors prominently",
      "Test different image styles (lifestyle vs product-focused)",
    ],
  },
  "performance-max": {
    platform: "performance-max",
    displayName: "Performance Max",
    characterLimit: 90,
    imageRatio: "Multiple: 1:1, 1.91:1, 4:5, 9:16 (vertical)",
    recommendedTone: "Versatile — adapts across all Google channels automatically",
    ctaRules: "Asset group optimization. Provide maximum assets (headlines, images, videos) for Google AI to mix and match.",
    seoRequirements: "Google's AI optimizes automatically. Provide diverse assets for best results.",
    bestPractices: [
      "Upload 15+ images per asset group (all ratios)",
      "Provide 5+ headlines and 5+ long headlines",
      "Include at least one YouTube video (10-30 seconds)",
      "Add audience signals to guide Google's AI",
      "Set clear conversion goals for the campaign",
    ],
  },
  email: {
    platform: "email",
    displayName: "Email",
    characterLimit: 0, // no practical limit
    imageRatio: "600px wide recommended for email clients",
    recommendedTone: "Personalised, warm, value-first",
    ctaRules: "One primary CTA per email. Button CTAs outperform text links. Above-the-fold placement recommended.",
    seoRequirements: "Email doesn't require traditional SEO. Focus on deliverability (SPF, DKIM, DMARC) and subject line optimisation.",
    bestPractices: [
      "Subject lines under 50 characters have highest open rates",
      "Personalise with recipient name and relevant content",
      "Use preview text to complement the subject line",
      "Mobile-first design (60%+ of emails opened on mobile)",
      "Segment audiences for targeted messaging",
    ],
  },
  "landing-page": {
    platform: "landing-page",
    displayName: "Landing Page",
    characterLimit: 0,
    imageRatio: "Hero image: 1200x800px or 16:9",
    recommendedTone: "Conversion-focused, benefit-driven, trust-building",
    ctaRules: "Single, clear CTA above the fold. Use contrasting button colors. Remove navigation to reduce friction.",
    seoRequirements: "Target primary keyword in H1, meta title, and URL. Fast page load (Core Web Vitals). Mobile responsive required.",
    bestPractices: [
      "Headline should communicate the primary benefit in under 10 words",
      "Include social proof (testimonials, client logos, case study stats)",
      "Use directional cues (arrows, gaze direction) pointing to CTA",
      "Minimize form fields to reduce friction",
      "A/B test headlines, CTAs, and hero images",
    ],
  },
  blog: {
    platform: "blog",
    displayName: "Blog",
    characterLimit: 0,
    imageRatio: "Featured image: 1200x630px (Open Graph size)",
    recommendedTone: "Informative, well-researched, engaging",
    ctaRules: "Contextual CTAs within content. End-of-post CTA for newsletter signup or lead magnet. Internal links to related content.",
    seoRequirements: "Target primary keyword in H1, meta description (150-160 chars), URL slug. Use H2/H3 for structure. Internal linking strategy. Alt text on images.",
    bestPractices: [
      "Target articles 1500-2500 words for SEO (long-form ranks better)",
      "Use featured image with proper alt text",
      "Include table of contents for long posts (improves UX and featured snippets)",
      "Link to 3-5 internal articles and 1-2 external authority sources",
      "Add schema markup (Article, FAQ, or HowTo as applicable)",
    ],
  },
  poster: {
    platform: "poster",
    displayName: "Poster",
    characterLimit: 100,
    imageRatio: "A-series (A4, A3) or custom sizing",
    recommendedTone: "Bold, attention-grabbing, minimal text",
    ctaRules: "One clear CTA — event date, website, or QR code. Contact info in footer.",
    seoRequirements: "N/A for print. For digital distribution, use descriptive filenames and alt text.",
    bestPractices: [
      "Use high-contrast colors for legibility from distance",
      "Keep text to a minimum — posters are visual-first",
      "Include a clear hierarchy: Headline → Date → CTA",
      "QR codes should be large enough to scan easily",
      "Brand logo in consistent position (top or bottom)",
    ],
  },
  flyer: {
    platform: "flyer",
    displayName: "Flyer",
    characterLimit: 200,
    imageRatio: "A5, A6, or DL (1/3 A4)",
    recommendedTone: "Promotional, energetic, concise",
    ctaRules: "Clear offer or call-to-action. Tear-off tabs or QR code for events.",
    seoRequirements: "N/A for print.",
    bestPractices: [
      "Front-load the most important information",
      "Use bullet points for key benefits or features",
      "Include expiration date for time-sensitive offers",
      "Double-sided printing doubles your message space",
      "Test readability at arm's length",
    ],
  },
  brochure: {
    platform: "brochure",
    displayName: "Brochure",
    characterLimit: 500,
    imageRatio: "Tri-fold (A4 landscape) or bi-fold",
    recommendedTone: "Professional, comprehensive, persuasive",
    ctaRules: "Back panel should contain contact info and CTA. QR code to website or booking page.",
    seoRequirements: "N/A for print. For PDF downloads, optimize filename and include metadata.",
    bestPractices: [
      "Front panel: strong visual + headline",
      "Inside panels: detailed information with visuals",
      "Back panel: contact info + CTA",
      "Use consistent branding across all panels",
      "Leave white space — don't overcrowd",
    ],
  },
  standee: {
    platform: "standee",
    displayName: "Standee / Roll-up Banner",
    characterLimit: 50,
    imageRatio: "850mm x 2000mm (portrait, tall format)",
    recommendedTone: "Ultra-concise, brand-forward, visual",
    ctaRules: "One line CTA at bottom. QR code optional. Must be readable from 3m distance.",
    seoRequirements: "N/A.",
    bestPractices: [
      "Readable from 2-3 meters distance",
      "Logo at top, CTA at bottom (eye-level hierarchy)",
      "Maximum 3 lines of text",
      "High-resolution images required (150-300 DPI at full size)",
      "Contrast is critical — dark text on light background or vice versa",
    ],
  },
  whatsapp: {
    platform: "whatsapp",
    displayName: "WhatsApp",
    characterLimit: 1024,
    imageRatio: "1:1 (square) for attached creative",
    recommendedTone: "Direct, personal, conversational",
    ctaRules: "One clear action per message. Use WhatsApp's native quick-reply/CTA buttons where available.",
    seoRequirements: "N/A — direct messaging channel, not indexed.",
    bestPractices: [
      "Front-load the value in the first line — previews truncate early",
      "Keep messages scannable on a small screen",
      "Personalise with recipient name where possible",
      "Respect opt-in/consent requirements before sending",
    ],
  },
  sms: {
    platform: "sms",
    displayName: "SMS",
    characterLimit: 160,
    imageRatio: "N/A (text-only channel)",
    recommendedTone: "Ultra-concise, urgent, action-oriented",
    ctaRules: "One short link or one clear next step. No room for more than a single CTA.",
    seoRequirements: "N/A.",
    bestPractices: [
      "Stay within a single 160-character segment where possible",
      "Lead with the offer or reason to act",
      "Always include an opt-out instruction where required by policy",
      "Use a shortened link for tracking",
    ],
  },
};

export const PlatformContextService = {
  /**
   * Get platform constraints for a given platform.
   */
  getConstraints(platform: Platform): PlatformConstraints {
    return { ...PLATFORM_CONSTRAINTS[platform] };
  },

  /**
   * Get all supported platforms.
   */
  getAllPlatforms(): Platform[] {
    return Object.keys(PLATFORM_CONSTRAINTS) as Platform[];
  },

  /**
   * Map a content type to its most appropriate platform.
   */
  mapContentTypeToPlatform(contentType: string): Platform {
    const mapping: Record<string, Platform> = {
      "blog-article": "blog",
      "facebook-post": "facebook",
      "instagram-caption": "instagram",
      "linkedin-post": "linkedin",
      "x-post": "linkedin",
      "google-search-ad": "google-ads",
      "google-display-ad": "google-display",
      "meta-ad": "facebook",
      "email": "email",
      "landing-page": "landing-page",
      "product-description": "landing-page",
      "press-release": "blog",
      "video-script": "instagram",
      "cta": "landing-page",
      "headline": "landing-page",
      "whatsapp-campaign": "whatsapp",
      "sms": "sms",
      "brochure-copy": "brochure",
      "case-study": "blog",
    };
    return mapping[contentType] ?? "blog";
  },
};