/**
 * Calixo Platform — Content Studio Mock Data
 * Enterprise-grade realistic sample data for the Content Studio module.
 */

// Type-only imports — no runtime imports needed

// ============================================================================
// Types
// ============================================================================

export type ContentStatus = "published" | "scheduled" | "draft" | "in_review" | "archived";
export type ContentType = "blog" | "social" | "email" | "landing" | "ad" | "video" | "infographic" | "whitepaper";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  author: string;
  authorAvatar: string;
  platform: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  tags: string[];
  engagement?: number;
  reach?: number;
  thumbnail?: string;
  contentScore: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: ContentType;
  description: string;
  category: string;
  usageCount: number;
  isAIGenerated: boolean;
  createdAt: string;
  tags: string[];
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  title: string;
  platform: string;
  scheduledFor: string;
  status: "pending" | "ready" | "failed";
  author: string;
}

export interface ApprovalRequest {
  id: string;
  contentId: string;
  title: string;
  author: string;
  submittedAt: string;
  reviewer: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected";
}

export interface ContentAsset {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "audio";
  format: string;
  size: string;
  uploadedAt: string;
  url: string;
  tags: string[];
}

export interface AISession {
  id: string;
  title: string;
  prompt: string;
  model: string;
  createdAt: string;
  outputType: ContentType;
  creditsUsed: number;
  status: "completed" | "running" | "failed";
}

export interface SEOReport {
  id: string;
  title: string;
  contentType: ContentType;
  score: number;
  generatedAt: string;
  keywords: string[];
  suggestions: number;
}

export interface ContentKpi {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down";
  icon: string;
}

// ============================================================================
// KPIs
// ============================================================================

export const contentKpis: ContentKpi[] = [
  { id: "total", title: "Total Content", value: 1247, change: 12.5, trend: "up", icon: "FileText" },
  { id: "published", title: "Published", value: 892, change: 8.3, trend: "up", icon: "CheckCircle" },
  { id: "scheduled", title: "Scheduled", value: 156, change: -2.1, trend: "down", icon: "Calendar" },
  { id: "drafts", title: "Drafts", value: 143, change: 15.7, trend: "up", icon: "FileEdit" },
  { id: "aiCredits", title: "AI Credits", value: "2.4K", change: 22.0, trend: "up", icon: "Sparkles" },
  { id: "team", title: "Team Members", value: 18, change: 0, trend: "up", icon: "Teams" },
  { id: "score", title: "Content Score", value: 87, change: 3.2, trend: "up", icon: "Hash" },
  { id: "engagement", title: "Avg Engagement", value: "4.8%", change: -0.3, trend: "down", icon: "Globe" },
];

// ============================================================================
// Content Items (100)
// ============================================================================

const authors = [
  { name: "Sarah Chen", avatar: "SC" },
  { name: "Marcus Rivera", avatar: "MR" },
  { name: "Emily Park", avatar: "EP" },
  { name: "David Kim", avatar: "DK" },
  { name: "Jessica Taylor", avatar: "JT" },
  { name: "Ryan O'Brien", avatar: "RO" },
  { name: "Priya Sharma", avatar: "PS" },
  { name: "Alex Wong", avatar: "AW" },
];

const contentTitles = [
  "The Future of AI-Powered Marketing Automation",
  "10 Strategies for Boosting Social Media Engagement",
  "How to Build a Data-Driven Content Calendar",
  "Mastering Enterprise SEO in 2025",
  "The Complete Guide to Brand Storytelling",
  "Why Video Content Dominates Consumer Attention",
  "Email Marketing Benchmarks: Q3 2025 Report",
  "Landing Page Optimization: A/B Testing Framework",
  "Social Media Algorithm Changes You Need to Know",
  "Content Personalization at Enterprise Scale",
  "The Rise of AI-Generated Content: Opportunities and Risks",
  "Building a Cross-Platform Content Strategy",
  "How Calixo Customers Achieve 3x Content ROI",
  "The Psychology Behind High-Converting Copy",
  "B2B Content Marketing Trends for Enterprise",
  "Measuring Content Performance Beyond Vanity Metrics",
  "How to Create a Content Governance Framework",
  "The Ultimate Content Distribution Checklist",
  "AI vs Human: Finding the Right Content Balance",
  "Why Your Content Audit is Your Best Strategy Tool",
];

const blogTitles = [
  "The ROI of Content Marketing: Enterprise Benchmarks",
  "How to Scale Content Operations with AI",
  "Content Workflow Automation: A Practical Guide",
  "The Enterprise Guide to Content Compliance",
  "Building a Content-First Organization Culture",
  "Content Localization Strategies for Global Brands",
  "The Science of Content Velocity and Publishing Cadence",
  "Why Brand Consistency Drives Revenue Growth",
  "Content Analytics: From Data to Actionable Insights",
  "The Future of Headless CMS in Enterprise",
];

const socialTitles = [
  "Behind the Scenes: Our Content Creation Process",
  "Customer Success Story: 200% Growth in 6 Months",
  "Quick Tip: Optimize Your LinkedIn Profile Today",
  "Thread: How We Built Our Content Engine 🧵",
  "Poll: What's Your Biggest Content Challenge?",
  "New Feature Alert: AI Content Scoring is Live",
  "We're Hiring: Join Our Content Innovation Team",
  "Infographic: The State of Content Marketing 2025",
  "Live Q&A: Ask Our Content Strategists Anything",
  "Milestone: 10,000 Pieces of Content Published",
];

const allTitles = [...contentTitles, ...blogTitles, ...socialTitles];

const contentTypes: ContentType[] = ["blog", "social", "email", "landing", "ad", "video", "infographic", "whitepaper"];
const statuses: ContentStatus[] = ["published", "scheduled", "draft", "in_review", "archived"];
const platforms = ["Web", "LinkedIn", "Instagram", "Twitter/X", "Facebook", "YouTube", "TikTok", "Email", "Blog"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random() * (e - s)).toISOString();
}

function generateContentItems(count: number): ContentItem[] {
  const items: ContentItem[] = [];
  for (let i = 1; i <= count; i++) {
    const title = allTitles[i % allTitles.length] + (i > allTitles.length ? ` (${i})` : "");
    const type = randomFrom(contentTypes);
    const status = randomFrom(statuses);
    const author = randomFrom(authors);
    const createdAt = randomDate("2024-06-01", "2025-07-04");
    const publishedAt = status === "published" ? new Date(new Date(createdAt).getTime() + 86400000 * Math.floor(Math.random() * 30)).toISOString() : undefined;
    items.push({
      id: `content-${String(i).padStart(4, "0")}`,
      title,
      type,
      status,
      author: author.name,
      authorAvatar: author.avatar,
      platform: randomFrom(platforms),
      wordCount: Math.floor(Math.random() * 3000) + 200,
      createdAt,
      updatedAt: new Date(new Date(createdAt).getTime() + 86400000 * Math.floor(Math.random() * 10)).toISOString(),
      scheduledFor: status === "scheduled" ? randomDate("2025-07-05", "2025-08-30") : undefined,
      publishedAt,
      tags: [randomFrom(["AI", "Marketing", "SEO", "Social", "Enterprise", "Strategy", "Analytics"]), randomFrom(["Guide", "Report", "Case Study", "Tutorial", "Opinion"])],
      engagement: Math.floor(Math.random() * 50000) + 100,
      reach: Math.floor(Math.random() * 200000) + 1000,
      thumbnail: `https://picsum.photos/seed/${i}/400/300`,
      contentScore: Math.floor(Math.random() * 40) + 60,
    });
  }
  return items;
}

export const contentItems: ContentItem[] = generateContentItems(100);

// ============================================================================
// Templates (25)
// ============================================================================

export const contentTemplates: ContentTemplate[] = Array.from({ length: 25 }, (_, i) => ({
  id: `template-${String(i + 1).padStart(3, "0")}`,
  name: [
    "Blog Post Pro", "Social Media Carousel", "Email Newsletter", "Landing Page Hero",
    "Case Study Layout", "Product Launch Announcement", "Weekly Roundup", "How-To Guide",
    "Comparison Chart", "Executive Summary", "Video Script Template", "Infographic Blueprint",
    "Webinar Landing Page", "Press Release Format", "Thought Leadership Article",
    "Customer Testimonial", "Feature Announcement", "Holiday Campaign", "Industry Report",
    "Quick Start Guide", "FAQ Template", "Event Promotion", "Whitepaper Structure",
    "Podcast Show Notes", "A/B Test Framework",
  ][i],
  type: randomFrom(contentTypes),
  description: `Professional template for creating high-impact ${["blog posts", "social content", "email campaigns", "landing pages", "ad creatives"][i % 5]}. Includes AI-powered suggestions and brand guidelines.`,
  category: randomFrom(["Blog", "Social", "Email", "Landing Page", "Ads"]),
  usageCount: Math.floor(Math.random() * 500) + 10,
  isAIGenerated: Math.random() > 0.4,
  createdAt: randomDate("2024-09-01", "2025-06-30"),
  tags: [randomFrom(["AI-Optimized", "Branded", "Conversion", "SEO", "Engagement"]), randomFrom(["Premium", "Free", "Enterprise"])],
}));

// ============================================================================
// Scheduled Posts (20)
// ============================================================================

export const scheduledPosts: ScheduledPost[] = Array.from({ length: 20 }, (_, i) => ({
  id: `scheduled-${String(i + 1).padStart(3, "0")}`,
  contentId: contentItems[i]?.id ?? `content-${String(i + 1).padStart(4, "0")}`,
  title: contentItems[i]?.title ?? `Scheduled Post ${i + 1}`,
  platform: randomFrom(platforms),
  scheduledFor: randomDate("2025-07-05", "2025-07-30"),
  status: randomFrom(["pending", "ready", "failed"] as const),
  author: randomFrom(authors).name,
}));

// ============================================================================
// Approval Requests (10)
// ============================================================================

export const approvalRequests: ApprovalRequest[] = Array.from({ length: 10 }, (_, i) => ({
  id: `approval-${String(i + 1).padStart(3, "0")}`,
  contentId: contentItems[50 + i]?.id ?? `content-${String(50 + i + 1).padStart(4, "0")}`,
  title: contentItems[50 + i]?.title ?? `Content Item ${50 + i + 1}`,
  author: randomFrom(authors).name,
  submittedAt: randomDate("2025-07-01", "2025-07-04"),
  reviewer: randomFrom(authors).name,
  urgency: randomFrom(["low", "medium", "high", "critical"] as const),
  status: randomFrom(["pending", "approved", "rejected"] as const),
}));

// ============================================================================
// Assets (50)
// ============================================================================

export const contentAssets: ContentAsset[] = Array.from({ length: 50 }, (_, i) => ({
  id: `asset-${String(i + 1).padStart(3, "0")}`,
  name: [
    "hero-banner-v2.png", "product-demo.mp4", "whitepaper-2025.pdf", "brand-guidelines.pdf",
    "social-template-pack.zip", "email-header.jpg", "case-study-graphics.ai", "infographic-data.csv",
    "team-photo-2025.jpg", "logo-variants.zip", "podcast-episode-42.mp3", "webinar-recording.mp4",
  ][i % 12] || `asset-file-${i + 1}`,
  type: randomFrom(["image", "video", "document", "audio"]),
  format: randomFrom(["PNG", "JPG", "MP4", "PDF", "AI", "ZIP", "CSV", "MP3"]),
  size: `${(Math.random() * 50 + 0.5).toFixed(1)} MB`,
  uploadedAt: randomDate("2024-11-01", "2025-07-03"),
  url: `https://assets.calixo.io/content/${String(i + 1).padStart(3, "0")}`,
  tags: [randomFrom(["brand", "marketing", "product", "social", "blog"]), randomFrom(["hero", "banner", "icon", "template"])],
}));

// ============================================================================
// AI Sessions (10)
// ============================================================================

export const aiSessions: AISession[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ai-session-${String(i + 1).padStart(3, "0")}`,
  title: [
    "Generate Blog Post Outline: AI Marketing",
    "Rewrite Landing Page Copy for Conversion",
    "Create Social Media Caption Set",
    "SEO Keyword Research for Q3 Campaign",
    "Generate Email Subject Line Variants",
    "Content Gap Analysis Report",
    "Rewrite Product Description for Clarity",
    "Generate Hashtag Strategy for Launch",
    "Create Ad Copy Variants for A/B Test",
    "Content Performance Summary with Insights",
  ][i],
  prompt: `Create high-quality ${randomFrom(contentTypes)} content about ${["AI marketing", "enterprise SEO", "social media strategy", "content automation", "brand growth"][i % 5]}...`,
  model: randomFrom(["calixo-default", "gpt-4o", "claude-3-5"]),
  createdAt: randomDate("2025-06-01", "2025-07-04"),
  outputType: randomFrom(contentTypes),
  creditsUsed: Math.floor(Math.random() * 50) + 5,
  status: randomFrom(["completed", "completed", "completed", "running", "failed"] as const),
}));

// ============================================================================
// SEO Reports (5)
// ============================================================================

export const seoReports: SEOReport[] = Array.from({ length: 5 }, (_, i) => ({
  id: `seo-report-${String(i + 1).padStart(3, "0")}`,
  title: [
    "Homepage SEO Audit",
    "Blog Category Optimization",
    "Landing Page Performance Review",
    "Q3 Keyword Strategy Assessment",
    "Competitor SEO Gap Analysis",
  ][i],
  contentType: randomFrom(contentTypes),
  score: Math.floor(Math.random() * 30) + 65,
  generatedAt: randomDate("2025-06-15", "2025-07-03"),
  keywords: [
    "enterprise content marketing",
    "AI content generation",
    "SEO optimization",
    "content strategy",
    "marketing automation",
    "brand awareness",
    "lead generation",
    "conversion rate",
  ].slice(0, Math.floor(Math.random() * 5) + 3),
  suggestions: Math.floor(Math.random() * 15) + 3,
}));

// ============================================================================
// Content Production Chart Data
// ============================================================================

export const contentProductionData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  blog: Math.floor(Math.random() * 40) + 20,
  social: Math.floor(Math.random() * 80) + 40,
  email: Math.floor(Math.random() * 25) + 10,
  video: Math.floor(Math.random() * 15) + 5,
}));

export const platformDistributionData = [
  { platform: "Blog", percentage: 28, color: "#06B6D4" },
  { platform: "LinkedIn", percentage: 22, color: "#0A66C2" },
  { platform: "Instagram", percentage: 18, color: "#E4405F" },
  { platform: "Twitter/X", percentage: 12, color: "#1DA1F2" },
  { platform: "Email", percentage: 10, color: "#10B981" },
  { platform: "YouTube", percentage: 7, color: "#FF0000" },
  { platform: "TikTok", percentage: 3, color: "#000000" },
];

export const publishingTimelineData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2025-06-05");
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().split("T")[0],
    published: Math.floor(Math.random() * 8) + 2,
    scheduled: Math.floor(Math.random() * 5) + 1,
  };
});