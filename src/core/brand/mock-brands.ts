/** Calixo Platform — Mock Brand Data (3 Enterprise Brands) */
import type { BrandKit } from "./types";

const color = (name: string, hex: string): any => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return { name, hex, rgb: `rgb(${r},${g},${b})`, hsl: `hsl(${Math.round(360*(r/255))},70%,50%)` };
};

export const MOCK_BRANDS: BrandKit[] = [
  {
    id: "brand-calixo",
    profile: {
      id: "brand-calixo", organizationName: "Calixo Technologies Inc.", brandName: "Calixo", shortName: "CLX",
      description: "Enterprise AI Marketing Operating System powering the next generation of marketing teams.",
      mission: "Empower every marketing team with AI-driven content intelligence.",
      vision: "To become the operating system for enterprise content creation and distribution.",
      tagline: "Create. Automate. Dominate.", website: "https://calixo.io", industry: "Marketing Technology",
      businessType: "SaaS", timezone: "UTC+5:30", defaultLanguage: "English",
    },
    logos: { primary: "/brands/calixo/logo-primary.svg", secondary: "/brands/calixo/logo-secondary.svg", monochrome: "/brands/calixo/logo-mono.svg", dark: "/brands/calixo/logo-dark.svg", light: "/brands/calixo/logo-light.svg", favicon: "/favicon.ico", minSize: 48, clearSpace: 16, usageRules: ["Maintain clear space of 16px around logo", "Do not stretch or distort", "Use provided colour variants only", "Minimum size: 48px for digital, 20mm for print"] },
    colors: {
      primary: color("Cyan", "#06B6D4"), secondary: color("Emerald", "#10B981"), accent: color("Purple", "#8B5CF6"),
      neutral: color("Slate", "#64748B"), success: color("Emerald", "#10B981"), warning: color("Amber", "#F59E0B"),
      danger: color("Red", "#EF4444"), background: color("Dark", "#0F172A"), surface: color("Surface", "#1E293B"),
      text: color("White", "#F8FAFC"), border: color("Border", "#334155"),
    },
    typography: {
      headingFont: "Inter", bodyFont: "Inter", displayFont: "Inter", fallbackFonts: ["Arial", "sans-serif"],
      fontWeights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
      typeScale: {
        "display-xl": { size: "72px", lineHeight: "1.1", letterSpacing: "-0.02em" },
        h1: { size: "40px", lineHeight: "1.25", letterSpacing: "-0.01em" },
        h2: { size: "32px", lineHeight: "1.3", letterSpacing: "-0.005em" },
        h3: { size: "24px", lineHeight: "1.35", letterSpacing: "0" },
        "body-lg": { size: "18px", lineHeight: "1.5", letterSpacing: "0" },
        "body-md": { size: "16px", lineHeight: "1.5", letterSpacing: "0" },
        "body-sm": { size: "14px", lineHeight: "1.5", letterSpacing: "0" },
        caption: { size: "12px", lineHeight: "1.4", letterSpacing: "0.01em" },
      },
    },
    voice: { tone: "Professional, innovative, empowering", writingStyle: "Clear, concise, benefit-driven", communicationStyle: "Direct, data-backed, authoritative yet approachable", preferredVocabulary: ["transformative", "enterprise-grade", "intelligent", "scalable", "proven", "seamless"], forbiddenWords: ["cheap", "maybe", "hopefully", "just", "basic"], ctaStyle: "Action-oriented, benefit-led (e.g., 'Start Free Trial →')", grammarRules: ["Use Oxford comma", "Sentence case for headlines", "Active voice preferred"], capitalizationRules: "Sentence case for headings and CTAs", emojiUsage: "Sparse — max 1-2 per social post, none in formal content" },
    visualGuidelines: { photographyStyle: "Professional, high-contrast, authentic corporate", illustrationStyle: "Flat vector, geometric, blue-cyan-purple palette", iconStyle: "Lucide line icons, consistent 1.5px stroke", imageStyle: "Clean compositions, rule of thirds, natural lighting", layoutStyle: "Grid-based, generous whitespace, card-driven", spacingStyle: "8px base unit (4, 8, 16, 24, 32, 48)", cornerRadius: "12px for cards, 8px for buttons, 9999px for pills", shadowStyle: "Subtle elevation (0 4px 6px -1px rgba(0,0,0,0.1))", animationStyle: "200-300ms ease-in-out, Framer Motion spring for interactive elements" },
    platformOverrides: [
      { platform: "instagram", tone: "Casual, visual-first, emoji-friendly", cta: "Link in bio ↑" },
      { platform: "linkedin", tone: "Thought-leadership, professional insights, data-driven", cta: "Learn more →" },
      { platform: "google-ads", colors: { primary: color("Cyan", "#06B6D4"), accent: color("Amber", "#F59E0B") } },
    ],
    aiSettings: { preferredModel: "calixo-default", creativity: 0.7, brandStrictness: 0.85, complianceStrictness: 0.9, seoStrictness: 0.8, temperature: 0.7, preferredImageStyle: "Professional corporate photography", preferredCreativeStyle: "Minimalist" },
    assets: [
      { id: "a1", name: "Primary Logo", type: "logo", url: "/brands/calixo/logo-primary.svg", format: "SVG", size: "24KB", uploadedAt: "2025-01-15", tags: ["logo", "primary"] },
      { id: "a2", name: "Brand Guidelines PDF", type: "document", url: "/brands/calixo/guidelines.pdf", format: "PDF", size: "4.2MB", uploadedAt: "2025-02-01", tags: ["guidelines", "brand"] },
      { id: "a3", name: "Hero Pattern", type: "pattern", url: "/brands/calixo/pattern-dots.svg", format: "SVG", size: "8KB", uploadedAt: "2025-03-10", tags: ["pattern", "background"] },
      { id: "a4", name: "Team Photo", type: "image", url: "/brands/calixo/team.jpg", format: "JPG", size: "1.8MB", uploadedAt: "2025-04-05", tags: ["team", "photography"] },
      { id: "a5", name: "Product Demo", type: "video", url: "/brands/calixo/demo.mp4", format: "MP4", size: "24MB", uploadedAt: "2025-05-20", tags: ["demo", "video"] },
    ],
  },
  {
    id: "brand-rgu",
    profile: {
      id: "brand-rgu", organizationName: "Royal Global University", brandName: "Royal Global University", shortName: "RGU",
      description: "A world-class institution committed to academic excellence, research, and holistic development.",
      mission: "To nurture global leaders through innovative education, cutting-edge research, and community engagement.",
      vision: "To be a globally recognized centre of academic excellence shaping tomorrow's leaders.",
      tagline: "Shaping Leaders, Transforming Lives", website: "https://rgu.ac.in", industry: "Education",
      businessType: "University", timezone: "UTC+5:30", defaultLanguage: "English",
    },
    logos: { primary: "/brands/rgu/logo-primary.svg", secondary: "/brands/rgu/logo-secondary.svg", monochrome: "/brands/rgu/logo-mono.svg", dark: "/brands/rgu/logo-dark.svg", light: "/brands/rgu/logo-light.svg", favicon: "/brands/rgu/favicon.ico", minSize: 60, clearSpace: 20, usageRules: ["Maintain 20px clear space", "Do not alter the university crest", "Use approved colour variants", "Minimum size: 60px digital"] },
    colors: {
      primary: color("Royal Blue", "#1E3A8A"), secondary: color("Gold", "#D97706"), accent: color("Deep Red", "#991B1B"),
      neutral: color("Gray", "#6B7280"), success: color("Emerald", "#059669"), warning: color("Amber", "#D97706"),
      danger: color("Red", "#DC2626"), background: color("White", "#FFFFFF"), surface: color("Light", "#F3F4F6"),
      text: color("Dark", "#111827"), border: color("Border", "#D1D5DB"),
    },
    typography: {
      headingFont: "Playfair Display", bodyFont: "Source Serif 4", displayFont: "Playfair Display", fallbackFonts: ["Georgia", "serif"],
      fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      typeScale: {
        "display-xl": { size: "64px", lineHeight: "1.15", letterSpacing: "-0.01em" },
        h1: { size: "36px", lineHeight: "1.3", letterSpacing: "0" }, h2: { size: "28px", lineHeight: "1.35", letterSpacing: "0" },
        h3: { size: "22px", lineHeight: "1.4", letterSpacing: "0" }, "body-md": { size: "16px", lineHeight: "1.6", letterSpacing: "0" },
        "body-sm": { size: "14px", lineHeight: "1.6", letterSpacing: "0" }, caption: { size: "12px", lineHeight: "1.5", letterSpacing: "0.02em" },
      },
    },
    voice: { tone: "Authoritative, scholarly, inspiring", writingStyle: "Formal yet accessible, academic excellence, research-driven", communicationStyle: "Respectful, inclusive, forward-looking", preferredVocabulary: ["excellence", "innovation", "holistic", "transformative", "global"], forbiddenWords: ["cheap", "quick fix"], ctaStyle: "Dignified, aspirational (e.g., 'Apply Now', 'Explore Programmes')", grammarRules: ["Formal academic style", "Avoid contractions in official communications"], capitalizationRules: "Title case for programme names", emojiUsage: "None in formal communications; minimal in social media" },
    visualGuidelines: { photographyStyle: "Editorial, warm, authentic campus photography", illustrationStyle: "Heritage-inspired, detailed line art", iconStyle: "Solid, educational theme", imageStyle: "Warm tones, natural settings, student-centric", layoutStyle: "Traditional with modern accents, generous margins", spacingStyle: "12px base unit", cornerRadius: "4px", shadowStyle: "Subtle, classic", animationStyle: "Subtle fades, 400ms ease" },
    platformOverrides: [
      { platform: "instagram", tone: "Warm, student-life focused, inspirational", cta: "Link in bio" },
      { platform: "linkedin", tone: "Academic thought leadership, research highlights", cta: "Learn more" },
    ],
    aiSettings: { preferredModel: "gpt-4o", creativity: 0.5, brandStrictness: 0.95, complianceStrictness: 0.95, seoStrictness: 0.6, temperature: 0.5, preferredImageStyle: "Warm editorial photography", preferredCreativeStyle: "Classic Elegant" },
    assets: [
      { id: "r1", name: "University Crest", type: "logo", url: "/brands/rgu/crest.svg", format: "SVG", size: "32KB", uploadedAt: "2024-08-01", tags: ["logo", "crest"] },
      { id: "r2", name: "Campus Aerial", type: "image", url: "/brands/rgu/campus.jpg", format: "JPG", size: "3.1MB", uploadedAt: "2025-01-10", tags: ["campus", "photography"] },
    ],
  },
  {
    id: "brand-demo",
    profile: {
      id: "brand-demo", organizationName: "Demo Enterprise Ltd.", brandName: "Demo Enterprise", shortName: "DEMO",
      description: "A demonstration brand showcasing all Brand Kit features.", mission: "Demonstrate the full capabilities of the Calixo Brand Kit Platform.",
      vision: "To serve as the reference implementation for enterprise brand management.", tagline: "Powering Enterprise Brand Excellence",
      website: "https://demo.calixo.io", industry: "Technology", businessType: "SaaS", timezone: "UTC", defaultLanguage: "English",
    },
    logos: { primary: "/brands/demo/logo-primary.svg", secondary: "/brands/demo/logo-secondary.svg", monochrome: "/brands/demo/logo-mono.svg", dark: "/brands/demo/logo-dark.svg", light: "/brands/demo/logo-light.svg", favicon: "/brands/demo/favicon.ico", minSize: 40, clearSpace: 12, usageRules: ["12px clear space", "Do not rotate logo", "Use approved colours"] },
    colors: {
      primary: color("Indigo", "#6366F1"), secondary: color("Pink", "#EC4899"), accent: color("Teal", "#14B8A6"),
      neutral: color("Zinc", "#71717A"), success: color("Green", "#22C55E"), warning: color("Orange", "#F97316"),
      danger: color("Red", "#EF4444"), background: color("Zinc-950", "#09090B"), surface: color("Zinc-900", "#18181B"),
      text: color("Zinc-100", "#F4F4F5"), border: color("Zinc-700", "#3F3F46"),
    },
    typography: {
      headingFont: "Poppins", bodyFont: "Inter", displayFont: "Poppins", fallbackFonts: ["sans-serif"],
      fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
      typeScale: { h1: { size: "36px", lineHeight: "1.3", letterSpacing: "0" }, h2: { size: "28px", lineHeight: "1.35", letterSpacing: "0" }, "body-md": { size: "16px", lineHeight: "1.6", letterSpacing: "0" }, caption: { size: "12px", lineHeight: "1.5", letterSpacing: "0.01em" } },
    },
    voice: { tone: "Modern, bold, energetic", writingStyle: "Concise, punchy, benefit-led", communicationStyle: "Direct, engaging, slightly informal", preferredVocabulary: ["game-changing", "seamless", "powerful"], forbiddenWords: ["maybe", "perhaps"], ctaStyle: "Bold, direct (e.g., 'Get Started')", grammarRules: ["Use active voice", "Short sentences"], capitalizationRules: "Title case for buttons", emojiUsage: "Liberal on social, none in docs" },
    visualGuidelines: { photographyStyle: "Bold, high-contrast, dramatic lighting", illustrationStyle: "Abstract geometric, vibrant", iconStyle: "Filled icons, 2px stroke", imageStyle: "Dynamic angles, strong compositions", layoutStyle: "Asymmetric grid, bold use of negative space", spacingStyle: "8px grid", cornerRadius: "16px", shadowStyle: "Dramatic, glowing", animationStyle: "Snappy, 150-250ms" },
    platformOverrides: [],
    aiSettings: { preferredModel: "calixo-default", creativity: 0.8, brandStrictness: 0.7, complianceStrictness: 0.6, seoStrictness: 0.75, temperature: 0.8, preferredImageStyle: "Bold modern", preferredCreativeStyle: "Bold & Vibrant" },
    assets: [
      { id: "d1", name: "Demo Logo", type: "logo", url: "/brands/demo/logo.svg", format: "SVG", size: "18KB", uploadedAt: "2025-06-01", tags: ["logo"] },
    ],
  },
];