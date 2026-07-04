/**
 * Calixo Platform — Enterprise AI Prompt Templates
 * 30+ professional content generation templates organized by category.
 */

export type PromptCategory =
  | "blog"
  | "ads"
  | "email"
  | "seo"
  | "landing"
  | "sales"
  | "social"
  | "announcement"
  | "product";

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  prompt: string;
  tone: string;
  contentTypes: string[];
  estimatedTokens: number;
  quality: number; // 1-10
}

export const promptTemplates: PromptTemplate[] = [
  // ============================================================================
  // Blog (5 templates)
  // ============================================================================
  {
    id: "blog-listicle", name: "Listicle Post", category: "blog",
    description: "Engaging numbered list article with in-depth explanations",
    prompt: "Write a comprehensive listicle about [TOPIC] with [N] key points. Each point should include: a compelling heading, 3-4 sentences of explanation, a real-world example, and an actionable takeaway. Use a conversational yet authoritative tone.",
    tone: "Conversational", contentTypes: ["Blog Article"],
    estimatedTokens: 1200, quality: 9,
  },
  {
    id: "blog-howto", name: "How-To Guide", category: "blog",
    description: "Step-by-step instructional guide with professional formatting",
    prompt: "Create a detailed how-to guide on [TOPIC]. Structure: Introduction (why this matters), Prerequisites, Step-by-step instructions (5-8 steps with sub-bullets), Common mistakes to avoid, Pro tips, Conclusion with call-to-action.",
    tone: "Professional", contentTypes: ["Blog Article"],
    estimatedTokens: 1500, quality: 9,
  },
  {
    id: "blog-thought-leadership", name: "Thought Leadership", category: "blog",
    description: "Opinion piece establishing industry authority",
    prompt: "Write a thought leadership article on [TOPIC] from the perspective of [ROLE]. Include: provocative opening statement, 3 supporting arguments backed by data/trends, counter-argument acknowledgment, unique insight or prediction, conclusion that challenges conventional thinking.",
    tone: "Authoritative", contentTypes: ["Blog Article"],
    estimatedTokens: 1000, quality: 8,
  },
  {
    id: "blog-case-study", name: "Case Study", category: "blog",
    description: "Structured case study with problem-solution-results framework",
    prompt: "Write a case study about [COMPANY/PRODUCT]. Structure: Client background, Challenge (the problem), Solution (how it was solved), Implementation process, Results (with metrics), Key takeaways, Client testimonial quote.",
    tone: "Professional", contentTypes: ["Blog Article"],
    estimatedTokens: 1300, quality: 9,
  },
  {
    id: "blog-roundup", name: "Weekly Roundup", category: "blog",
    description: "Summarized collection of industry news and trends",
    prompt: "Create a weekly roundup covering [N] key developments in [INDUSTRY]. For each item: headline, 2-3 sentence summary, why it matters, link to source. Include an editorial introduction and a 'what to watch' section.",
    tone: "Informative", contentTypes: ["Blog Article"],
    estimatedTokens: 800, quality: 7,
  },

  // ============================================================================
  // Ads (6 templates)
  // ============================================================================
  {
    id: "ads-google-search", name: "Google Search Ad", category: "ads",
    description: "High-converting Google search ad copy optimized for CTR",
    prompt: "Generate 3 Google Search Ad variations for [PRODUCT/SERVICE]. Each ad must include: Headline 1 (30 chars max), Headline 2 (30 chars max), Headline 3 (30 chars max), Description 1 (90 chars max), Description 2 (90 chars max). Focus on [KEYWORD], include a clear CTA, and highlight [UNIQUE_SELLING_POINT].",
    tone: "Persuasive", contentTypes: ["Google Search Ad"],
    estimatedTokens: 400, quality: 9,
  },
  {
    id: "ads-google-display", name: "Google Display Ad", category: "ads",
    description: "Visually-oriented display ad copy with headline and body variants",
    prompt: "Create Google Display Ad copy for [PRODUCT]. Generate: 5 headline options (max 25 chars), 5 description options (max 90 chars), 3 CTA button texts. Theme: [CAMPAIGN_THEME]. Target audience: [AUDIENCE].",
    tone: "Engaging", contentTypes: ["Google Display Ad"],
    estimatedTokens: 350, quality: 8,
  },
  {
    id: "ads-meta-carousel", name: "Meta Carousel Ad", category: "ads",
    description: "Multi-slide Meta (Facebook/Instagram) carousel ad",
    prompt: "Create a 5-slide Meta Carousel Ad for [PRODUCT]. Slide 1: Hook/question, Slide 2: Problem, Slide 3: Solution, Slide 4: Social proof/Testimonial, Slide 5: Strong CTA. Each slide: 40 words max, emoji-friendly, benefit-focused.",
    tone: "Conversational", contentTypes: ["Meta Ad", "Facebook Post"],
    estimatedTokens: 500, quality: 9,
  },
  {
    id: "ads-meta-video", name: "Meta Video Ad Script", category: "ads",
    description: "15-30 second video ad script for Meta platforms",
    prompt: "Write a [DURATION]-second video ad script for [PRODUCT]. Structure: Hook (first 3 seconds), Problem, Solution demo, Benefits, Social proof, CTA. Include visual instructions [in brackets] and spoken text. Add text overlay suggestions.",
    tone: "Energetic", contentTypes: ["Meta Ad", "Video Script"],
    estimatedTokens: 600, quality: 8,
  },
  {
    id: "ads-linkedin-sponsored", name: "LinkedIn Sponsored Content", category: "ads",
    description: "Professional LinkedIn sponsored content optimized for B2B",
    prompt: "Create a LinkedIn Sponsored Content ad for [B2B_PRODUCT]. Include: attention-grabbing intro text (600 chars max), 3 key business value points, credibility indicator (e.g., 'Trusted by X companies'), professional CTA. Tone: authoritative yet approachable. Target: [ROLE].",
    tone: "Professional", contentTypes: ["LinkedIn Post"],
    estimatedTokens: 450, quality: 9,
  },
  {
    id: "ads-retargeting", name: "Retargeting Ad", category: "ads",
    description: "Personalized retargeting ad for returning visitors",
    prompt: "Write a retargeting ad for visitors who [ACTION]. Acknowledge their previous interaction, remind them of the value, create urgency with [OFFER/LIMITED_TIME], include social proof, strong CTA to complete the action.",
    tone: "Urgent", contentTypes: ["Meta Ad", "Google Display Ad"],
    estimatedTokens: 350, quality: 8,
  },

  // ============================================================================
  // Email (4 templates)
  // ============================================================================
  {
    id: "email-newsletter", name: "Newsletter", category: "email",
    description: "Engaging newsletter with multiple content sections",
    prompt: "Write a [WEEKLY/MONTHLY] newsletter for [AUDIENCE]. Structure: warm greeting, featured article summary (100 words), 3 quick tips/insights, curated industry news (3 items), community spotlight, upcoming events, sign-off with CTA. Subject line: attention-grabbing.",
    tone: "Friendly", contentTypes: ["Email"],
    estimatedTokens: 1000, quality: 8,
  },
  {
    id: "email-drip", name: "Drip Campaign Email", category: "email",
    description: "Automated drip campaign email sequence",
    prompt: "Create Email #[N] in a [N]-email drip campaign about [TOPIC]. Context: previous emails covered [PREVIOUS_TOPICS]. This email should: briefly recap, introduce [NEW_TOPIC], provide value (insight/tip/tool), soft pitch, next-step CTA. Keep under 200 words.",
    tone: "Helpful", contentTypes: ["Email"],
    estimatedTokens: 500, quality: 9,
  },
  {
    id: "email-promo", name: "Promotional Email", category: "email",
    description: "High-converting promotional email with urgency",
    prompt: "Write a promotional email for [PRODUCT/OFFER]. Include: attention-grabbing subject line (with emoji), preview text, compelling headline, benefit-focused body (3 bullet points), social proof/testimonial, limited-time offer with deadline, clear primary CTA button, secondary CTA link.",
    tone: "Persuasive", contentTypes: ["Email"],
    estimatedTokens: 600, quality: 9,
  },
  {
    id: "email-welcome", name: "Welcome Email", category: "email",
    description: "Onboarding welcome email for new subscribers",
    prompt: "Create a welcome email for new subscribers to [BRAND]. Include: warm welcome and gratitude, what to expect (content frequency/types), links to best resources/popular content, community invitation, social media links, clear next step CTA. Keep it personal and under 250 words.",
    tone: "Warm", contentTypes: ["Email"],
    estimatedTokens: 450, quality: 9,
  },

  // ============================================================================
  // SEO (3 templates)
  // ============================================================================
  {
    id: "seo-meta", name: "SEO Meta Description", category: "seo",
    description: "Optimized meta titles and descriptions for search engines",
    prompt: "Generate 5 SEO-optimized meta title (50-60 chars) and meta description (150-160 chars) pairs for [PAGE/TOPIC]. Primary keyword: [KEYWORD]. Secondary keywords: [KEYWORDS]. Each should be unique, include the primary keyword near the beginning, and have a compelling CTA.",
    tone: "Professional", contentTypes: ["Blog Article", "Landing Page"],
    estimatedTokens: 400, quality: 9,
  },
  {
    id: "seo-pillar", name: "Pillar Page Content", category: "seo",
    description: "Comprehensive pillar page content for topic clusters",
    prompt: "Write an SEO-optimized pillar page about [TOPIC]. Structure: H1 with primary keyword, executive summary, table of contents (H2s as anchor links), 8-12 comprehensive sections covering all aspects, FAQ section, resources/next steps. Target: 2500+ words. Include internal linking suggestions.",
    tone: "Comprehensive", contentTypes: ["Blog Article", "Landing Page"],
    estimatedTokens: 3000, quality: 9,
  },
  {
    id: "seo-product-page", name: "Product Page SEO", category: "seo",
    description: "SEO-optimized product page content",
    prompt: "Create SEO content for [PRODUCT] page. Include: optimized H1 with primary keyword, compelling product description (300 words), feature list with benefits, technical specifications, use cases, customer reviews (placeholder format), FAQ section, CTA section.",
    tone: "Professional", contentTypes: ["Product Description", "Landing Page"],
    estimatedTokens: 1000, quality: 8,
  },

  // ============================================================================
  // Landing Pages (3 templates)
  // ============================================================================
  {
    id: "landing-hero", name: "Landing Page Hero", category: "landing",
    description: "High-converting landing page hero section",
    prompt: "Create a landing page hero section for [PRODUCT/OFFER]. Include: main headline (powerful, benefit-driven, 10 words max), subheadline (supporting value proposition, 20 words max), primary CTA button text, secondary CTA text, trust indicators (social proof snippet, client logos note, stats), hero visual description.",
    tone: "Persuasive", contentTypes: ["Landing Page"],
    estimatedTokens: 500, quality: 9,
  },
  {
    id: "landing-webinar", name: "Webinar Registration", category: "landing",
    description: "Webinar/event registration landing page",
    prompt: "Create a webinar registration page for '[WEBINAR_TITLE]'. Include: compelling headline with key benefit, date/time/speaker info, 5 bullet points of what attendees will learn, speaker bio (50 words), social proof ('Join X attendees'), urgency element, registration form headline.",
    tone: "Exciting", contentTypes: ["Landing Page"],
    estimatedTokens: 700, quality: 9,
  },
  {
    id: "landing-sales", name: "Sales Page", category: "landing",
    description: "Long-form sales landing page with conversion elements",
    prompt: "Write a sales page for [PRODUCT]. Sections: attention headline, the problem, agitate the problem, introduce the solution, features & benefits breakdown (6-8 items), how it works (3 steps), pricing/offer, guarantee statement, testimonials (3), FAQ (5 questions), final CTA with urgency.",
    tone: "Persuasive", contentTypes: ["Landing Page"],
    estimatedTokens: 2000, quality: 9,
  },

  // ============================================================================
  // Social (5 templates)
  // ============================================================================
  {
    id: "social-instagram-caption", name: "Instagram Caption", category: "social",
    description: "Engaging Instagram caption with hashtags and CTA",
    prompt: "Write an Instagram caption for [POST_TYPE] about [TOPIC]. Include: attention hook in first line, main message (100-150 words), emoji breaks, personal insight/story, engagement question, call-to-action, 15 relevant hashtags (5 broad, 5 niche, 5 branded).",
    tone: "Casual", contentTypes: ["Instagram Caption"],
    estimatedTokens: 400, quality: 9,
  },
  {
    id: "social-linkedin-post", name: "LinkedIn Post", category: "social",
    description: "Professional LinkedIn post optimized for engagement",
    prompt: "Write a LinkedIn post about [TOPIC]. Format: hook in first line (question/statement/stat), main points with line breaks between each (3-5 points), personal experience or insight, call-to-action (comment your thoughts). Keep paragraphs short (1-2 sentences). Include 3 relevant hashtags.",
    tone: "Professional", contentTypes: ["LinkedIn Post"],
    estimatedTokens: 350, quality: 9,
  },
  {
    id: "social-x-thread", name: "X/Twitter Thread", category: "social",
    description: "Multi-tweet thread for X/Twitter with structured narrative",
    prompt: "Create a [N]-tweet thread about [TOPIC]. Tweet 1: Hook tweet (make people want to unfold). Tweets 2-[N-1]: Key points, data, insights. Final tweet: Summary + CTA + relevant link. Each tweet should be ~240 chars, numbered, and flow naturally. Include 2 relevant hashtags in final tweet.",
    tone: "Insightful", contentTypes: ["X Post"],
    estimatedTokens: 500, quality: 9,
  },
  {
    id: "social-facebook-post", name: "Facebook Post", category: "social",
    description: "Engaging Facebook post with multimedia suggestions",
    prompt: "Write a Facebook post promoting [CONTENT/OFFER]. Include: question or bold statement to open, 3-4 sentences of value/context, suggested image/video description [in brackets], clear CTA, 2-3 relevant hashtags. Optimize for Facebook's algorithm: encourage meaningful comments.",
    tone: "Conversational", contentTypes: ["Facebook Post"],
    estimatedTokens: 300, quality: 8,
  },
  {
    id: "social-product-launch", name: "Product Launch Social Kit", category: "social",
    description: "Multi-platform product launch social media kit",
    prompt: "Create a social media launch kit for [PRODUCT]. Include: announcement post (LinkedIn), behind-the-scenes post (Instagram), feature highlight thread (X/Twitter), customer problem post (Facebook), countdown post (Instagram Stories text), launch day post template (all platforms).",
    tone: "Exciting", contentTypes: ["LinkedIn Post", "Instagram Caption", "X Post", "Facebook Post"],
    estimatedTokens: 1000, quality: 9,
  },

  // ============================================================================
  // Announcements (3 templates)
  // ============================================================================
  {
    id: "announce-product", name: "Product Announcement", category: "announcement",
    description: "Professional product launch or feature announcement",
    prompt: "Write a product announcement for [PRODUCT/FEATURE]. Structure: exciting headline with launch date, what's new (3-5 key features), why we built it (the problem), who it's for, how to access/get started, what's next (roadmap teaser), thank you to team/community.",
    tone: "Exciting", contentTypes: ["Blog Article", "Press Release", "Email"],
    estimatedTokens: 800, quality: 9,
  },
  {
    id: "announce-press-release", name: "Press Release", category: "announcement",
    description: "Formal press release following AP style guidelines",
    prompt: "Write a press release: [CITY], [STATE] – [DATE] – [COMPANY] today announced [NEWS]. Include: headline, dateline, lead paragraph (who/what/when/where/why), 2-3 supporting paragraphs with quotes, boilerplate about company, media contact information.",
    tone: "Formal", contentTypes: ["Press Release"],
    estimatedTokens: 600, quality: 9,
  },
  {
    id: "announce-partnership", name: "Partnership Announcement", category: "announcement",
    description: "Strategic partnership announcement for stakeholders",
    prompt: "Create a partnership announcement for [COMPANY_A] and [COMPANY_B]. Include: joint headline, partnership overview, value for customers, quotes from both CEOs/leaders, key integration/collaboration details, timeline, what this means for the industry, CTA for more information.",
    tone: "Professional", contentTypes: ["Press Release", "Blog Article", "LinkedIn Post"],
    estimatedTokens: 750, quality: 9,
  },

  // ============================================================================
  // Product (3 templates)
  // ============================================================================
  {
    id: "product-description", name: "Product Description", category: "product",
    description: "Compelling e-commerce product description",
    prompt: "Write a product description for [PRODUCT]. Include: benefit-focused headline, emotional hook, key features (5-7 bullet points with benefits), technical specifications, ideal use cases, social proof element, guarantee/return policy mention. Optimize for both SEO and conversion.",
    tone: "Persuasive", contentTypes: ["Product Description"],
    estimatedTokens: 600, quality: 9,
  },
  {
    id: "product-comparison", name: "Product Comparison", category: "product",
    description: "Competitive product comparison content",
    prompt: "Create a fair product comparison between [PRODUCT_A] and [PRODUCT_B]. Structure: introduction (when to choose each), comparison table (features, pricing, support, integrations), detailed breakdown of 5 key differences, pros and cons for each, recommendation by use case, final verdict.",
    tone: "Objective", contentTypes: ["Blog Article", "Landing Page"],
    estimatedTokens: 1200, quality: 8,
  },
  {
    id: "product-testimonial", name: "Customer Testimonial", category: "product",
    description: "Structured customer testimonial content",
    prompt: "Write a customer testimonial based on these results: [RESULTS]. Include: customer name/role/company, their challenge before using [PRODUCT], the solution and implementation experience, specific quantifiable results, unexpected benefit, recommendation to others.",
    tone: "Authentic", contentTypes: ["Blog Article", "Landing Page", "Social Media Post"],
    estimatedTokens: 400, quality: 8,
  },
];