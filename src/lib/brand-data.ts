// ============================================================================
// Calixo Platform - Brand Monitoring Mock Data
// ============================================================================
// Enterprise-grade mock data for the Brand Monitoring module.
// In production, this data flows from the API/Prisma layer through
// the repository pattern, event bus, and AI orchestration pipeline.
// ============================================================================

export interface BrandKpi {
  id: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  description: string;
}

export const brandKpis: BrandKpi[] = [
  { id: '1', title: 'Brand Health Score', value: '87.4', change: '+5.2%', positive: true, icon: 'Heart', description: 'Overall brand sentiment and perception index' },
  { id: '2', title: 'Share of Voice', value: '34.2%', change: '+2.8%', positive: true, icon: 'BarChart3', description: 'Market conversation share vs competitors' },
  { id: '3', title: 'Total Mentions', value: '48,392', change: '+18.4%', positive: true, icon: 'MessageSquare', description: 'Total brand mentions across all channels' },
  { id: '4', title: 'Total Reach', value: '12.8M', change: '+24.1%', positive: true, icon: 'Eye', description: 'Estimated audience reach of all mentions' },
  { id: '5', title: 'Avg Sentiment', value: '72%', change: '-3.1%', positive: false, icon: 'TrendingUp', description: 'Average positive sentiment percentage' },
  { id: '6', title: 'Competitor Rank', value: '#2', change: 'Up 1 position', positive: true, icon: 'Trophy', description: 'Rank among tracked competitors' },
];

export interface SentimentTimelinePoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export const sentimentTimeline: SentimentTimelinePoint[] = [
  { date: 'Jun 1', positive: 68, neutral: 22, negative: 10 },
  { date: 'Jun 5', positive: 72, neutral: 18, negative: 10 },
  { date: 'Jun 9', positive: 65, neutral: 25, negative: 10 },
  { date: 'Jun 13', positive: 75, neutral: 17, negative: 8 },
  { date: 'Jun 17', positive: 70, neutral: 20, negative: 10 },
  { date: 'Jun 21', positive: 78, neutral: 15, negative: 7 },
  { date: 'Jun 25', positive: 72, neutral: 20, negative: 8 },
  { date: 'Jun 29', positive: 74, neutral: 18, negative: 8 },
  { date: 'Jul 3', positive: 71, neutral: 19, negative: 10 },
];

export interface PlatformDistribution {
  platform: string;
  mentions: number;
  percentage: number;
  color: string;
}

export const platformDistribution: PlatformDistribution[] = [
  { platform: 'Twitter/X', mentions: 18420, percentage: 38, color: '#1DA1F2' },
  { platform: 'Instagram', mentions: 12100, percentage: 25, color: '#E4405F' },
  { platform: 'LinkedIn', mentions: 6750, percentage: 14, color: '#0A66C2' },
  { platform: 'Facebook', mentions: 5320, percentage: 11, color: '#1877F2' },
  { platform: 'Reddit', mentions: 2910, percentage: 6, color: '#FF4500' },
  { platform: 'YouTube', mentions: 1940, percentage: 4, color: '#FF0000' },
  { platform: 'News/Blogs', mentions: 952, percentage: 2, color: '#6C757D' },
];

export interface CountryDistribution {
  country: string;
  flag: string;
  mentions: number;
  percentage: number;
}

export const countryDistribution: CountryDistribution[] = [
  { country: 'United States', flag: '🇺🇸', mentions: 18500, percentage: 38 },
  { country: 'India', flag: '🇮🇳', mentions: 9200, percentage: 19 },
  { country: 'United Kingdom', flag: '🇬🇧', mentions: 5800, percentage: 12 },
  { country: 'Germany', flag: '🇩🇪', mentions: 3900, percentage: 8 },
  { country: 'Canada', flag: '🇨🇦', mentions: 2900, percentage: 6 },
  { country: 'Australia', flag: '🇦🇺', mentions: 2400, percentage: 5 },
  { country: 'Brazil', flag: '🇧🇷', mentions: 1900, percentage: 4 },
  { country: 'France', flag: '🇫🇷', mentions: 1700, percentage: 3.5 },
  { country: 'Japan', flag: '🇯🇵', mentions: 1400, percentage: 3 },
  { country: 'Others', flag: '🌍', mentions: 700, percentage: 1.5 },
];

export interface KeywordCloudItem {
  text: string;
  value: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'up' | 'down' | 'stable';
}

export const keywordCloud: KeywordCloudItem[] = [
  { text: 'AI Marketing', value: 94, sentiment: 'positive', trend: 'up' },
  { text: 'Campaign Automation', value: 87, sentiment: 'positive', trend: 'up' },
  { text: 'Analytics', value: 82, sentiment: 'positive', trend: 'stable' },
  { text: 'ROI', value: 78, sentiment: 'positive', trend: 'up' },
  { text: 'Customer Support', value: 72, sentiment: 'neutral', trend: 'down' },
  { text: 'Pricing', value: 68, sentiment: 'negative', trend: 'stable' },
  { text: 'Integration', value: 65, sentiment: 'positive', trend: 'up' },
  { text: 'Performance', value: 62, sentiment: 'neutral', trend: 'stable' },
  { text: 'UX Design', value: 58, sentiment: 'positive', trend: 'up' },
  { text: 'API', value: 55, sentiment: 'positive', trend: 'up' },
  { text: 'Documentation', value: 52, sentiment: 'neutral', trend: 'stable' },
  { text: 'Bugs', value: 48, sentiment: 'negative', trend: 'down' },
  { text: 'Mobile App', value: 45, sentiment: 'positive', trend: 'up' },
  { text: 'Security', value: 42, sentiment: 'neutral', trend: 'stable' },
  { text: 'Onboarding', value: 38, sentiment: 'negative', trend: 'down' },
  { text: 'Templates', value: 35, sentiment: 'positive', trend: 'up' },
  { text: 'Dashboard', value: 32, sentiment: 'positive', trend: 'stable' },
  { text: 'Reports', value: 30, sentiment: 'neutral', trend: 'stable' },
  { text: 'Enterprise', value: 28, sentiment: 'positive', trend: 'up' },
  { text: 'Latency', value: 25, sentiment: 'negative', trend: 'down' },
];

export interface BrandMention {
  id: string;
  platform: string;
  platformIcon: string;
  author: string;
  authorAvatar: string;
  authorFollowers: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  reach: number;
  engagement: number;
  country: string;
  language: string;
  url: string;
  isFlagged: boolean;
  isResolved: boolean;
  detectedAt: string;
  tags: string[];
}

export const brandMentions: BrandMention[] = [
  {
    id: '1', platform: 'Twitter/X', platformIcon: '🐦', author: '@tech_insider', authorAvatar: '', authorFollowers: 125000,
    content: 'Calixo is absolutely crushing it with their new AI campaign automation. The ROI we are seeing is insane compared to traditional tools. Highly recommend for any marketing team serious about scaling.',
    sentiment: 'positive', sentimentScore: 0.92, reach: 85000, engagement: 3400,
    country: 'United States', language: 'English', url: 'https://twitter.com/tech_insider/status/1',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-04T10:23:00Z',
    tags: ['AI', 'Automation', 'ROI'],
  },
  {
    id: '2', platform: 'LinkedIn', platformIcon: '💼', author: 'Sarah Chen', authorAvatar: '', authorFollowers: 45000,
    content: 'Just completed our quarterly review. Calixo platform helped us achieve 312% ROI on our Q2 campaigns. The AI-powered insights were a game changer for our team.',
    sentiment: 'positive', sentimentScore: 0.95, reach: 62000, engagement: 2800,
    country: 'United States', language: 'English', url: 'https://linkedin.com/posts/sarahchen/2',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-04T09:15:00Z',
    tags: ['ROI', 'Q2 Review', 'AI Insights'],
  },
  {
    id: '3', platform: 'Reddit', platformIcon: '🤖', author: 'u/marketingpro99', authorAvatar: '', authorFollowers: 8500,
    content: 'Honest review after 3 months: Calixo is powerful but the learning curve is steep. Documentation needs improvement. Once you get past that, it is excellent.',
    sentiment: 'neutral', sentimentScore: 0.45, reach: 28000, engagement: 1200,
    country: 'Canada', language: 'English', url: 'https://reddit.com/r/marketing/3',
    isFlagged: false, isResolved: false, detectedAt: '2026-07-04T08:42:00Z',
    tags: ['Review', 'Documentation', 'Onboarding'],
  },
  {
    id: '4', platform: 'Twitter/X', platformIcon: '🐦', author: '@angry_customer21', authorAvatar: '', authorFollowers: 1200,
    content: 'Calixo billing is a nightmare. Charged twice for our enterprise plan and support took 4 days to respond. Not what you expect at this price point.',
    sentiment: 'negative', sentimentScore: 0.12, reach: 15000, engagement: 890,
    country: 'United Kingdom', language: 'English', url: 'https://twitter.com/angry_customer21/status/4',
    isFlagged: true, isResolved: false, detectedAt: '2026-07-04T07:30:00Z',
    tags: ['Billing', 'Support', 'Enterprise'],
  },
  {
    id: '5', platform: 'Instagram', platformIcon: '📷', author: '@marketing.influencer', authorAvatar: '', authorFollowers: 320000,
    content: 'This AI marketing tool is changing the game! Swipe to see our campaign results using Calixo 🚀 #AIMarketing #Calixo #MarketingAutomation',
    sentiment: 'positive', sentimentScore: 0.88, reach: 320000, engagement: 15600,
    country: 'United States', language: 'English', url: 'https://instagram.com/p/5',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-04T06:55:00Z',
    tags: ['AIMarketing', 'Influencer', 'Campaign'],
  },
  {
    id: '6', platform: 'LinkedIn', platformIcon: '💼', author: 'Marcus Thompson', authorAvatar: '', authorFollowers: 28000,
    content: 'Comparing marketing platforms for our agency. Calixo vs CompetitorX - Calixo wins on AI capabilities, CompetitorX wins on price. Detailed comparison thread.',
    sentiment: 'neutral', sentimentScore: 0.52, reach: 42000, engagement: 2100,
    country: 'Australia', language: 'English', url: 'https://linkedin.com/posts/marcust/6',
    isFlagged: false, isResolved: false, detectedAt: '2026-07-03T22:10:00Z',
    tags: ['Comparison', 'Agency', 'Pricing'],
  },
  {
    id: '7', platform: 'YouTube', platformIcon: '▶️', author: 'TechReviews HQ', authorAvatar: '', authorFollowers: 890000,
    content: 'ULTIMATE Calixo Platform Review 2026 - We tested every feature for 30 days. Watch before you buy! Full breakdown of features, pricing, and alternatives.',
    sentiment: 'positive', sentimentScore: 0.78, reach: 560000, engagement: 32400,
    country: 'United States', language: 'English', url: 'https://youtube.com/watch?v=7',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-03T20:00:00Z',
    tags: ['Review', 'YouTube', 'Comparison'],
  },
  {
    id: '8', platform: 'Twitter/X', platformIcon: '🐦', author: '@devops_dave', authorAvatar: '', authorFollowers: 18000,
    content: 'Calixo API rate limiting is way too aggressive. Getting 429 errors during normal usage. Please fix this @Calixo - makes automation impossible.',
    sentiment: 'negative', sentimentScore: 0.18, reach: 22000, engagement: 950,
    country: 'Germany', language: 'English', url: 'https://twitter.com/devops_dave/status/8',
    isFlagged: false, isResolved: false, detectedAt: '2026-07-03T18:30:00Z',
    tags: ['API', 'Rate Limiting', 'Bug'],
  },
  {
    id: '9', platform: 'Facebook', platformIcon: '📘', author: 'Marketing Pros Group', authorAvatar: '', authorFollowers: 95000,
    content: 'Question for the group: Anyone using Calixo for e-commerce campaigns? How does it handle product feed integration? Thinking of switching from our current tool.',
    sentiment: 'neutral', sentimentScore: 0.55, reach: 38000, engagement: 1800,
    country: 'Canada', language: 'English', url: 'https://facebook.com/groups/marketingpros/9',
    isFlagged: false, isResolved: false, detectedAt: '2026-07-03T16:45:00Z',
    tags: ['E-commerce', 'Integration', 'Question'],
  },
  {
    id: '10', platform: 'News/Blog', platformIcon: '📰', author: 'MarTech Today', authorAvatar: '', authorFollowers: 150000,
    content: 'Calixo Raises $50M Series B to Expand AI Marketing Platform - The company plans to double its engineering team and expand into APAC markets by Q4 2026.',
    sentiment: 'positive', sentimentScore: 0.85, reach: 180000, engagement: 5600,
    country: 'United States', language: 'English', url: 'https://martechtoday.com/calixo-series-b/10',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-03T14:00:00Z',
    tags: ['Funding', 'News', 'Expansion'],
  },
  {
    id: '11', platform: 'Instagram', platformIcon: '📷', author: '@digital_nomad_marketing', authorAvatar: '', authorFollowers: 65000,
    content: 'Running campaigns across 5 countries with Calixo. The multi-currency and multi-language support is seamless! 🌍✨',
    sentiment: 'positive', sentimentScore: 0.91, reach: 78000, engagement: 4200,
    country: 'Brazil', language: 'English', url: 'https://instagram.com/p/11',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-03T12:20:00Z',
    tags: ['Multi-currency', 'Global', 'Campaign'],
  },
  {
    id: '12', platform: 'Reddit', platformIcon: '🤖', author: 'u/enterprise_it_manager', authorAvatar: '', authorFollowers: 12000,
    content: 'We evaluated 7 marketing platforms for our enterprise. Calixo scored highest on security compliance (SOC2, GDPR, HIPAA). Detailed comparison in comments.',
    sentiment: 'positive', sentimentScore: 0.82, reach: 35000, engagement: 1600,
    country: 'United Kingdom', language: 'English', url: 'https://reddit.com/r/enterprise/12',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-03T10:00:00Z',
    tags: ['Enterprise', 'Security', 'Compliance'],
  },
  {
    id: '13', platform: 'Twitter/X', platformIcon: '🐦', author: '@startup_founder_42', authorAvatar: '', authorFollowers: 28000,
    content: 'Calixo just saved us $40K/month in marketing tool costs by consolidating 4 tools into 1. The ROI is unreal for startups.',
    sentiment: 'positive', sentimentScore: 0.94, reach: 52000, engagement: 2800,
    country: 'India', language: 'English', url: 'https://twitter.com/startup_founder_42/status/13',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-03T08:30:00Z',
    tags: ['Startup', 'Cost Savings', 'ROI'],
  },
  {
    id: '14', platform: 'LinkedIn', platformIcon: '💼', author: 'Priya Patel', authorAvatar: '', authorFollowers: 32000,
    content: 'Our team migrated from 3 separate tools to Calixo last month. The unified dashboard alone saved us 15 hours/week in reporting. Here is our migration story.',
    sentiment: 'positive', sentimentScore: 0.89, reach: 48000, engagement: 2300,
    country: 'India', language: 'English', url: 'https://linkedin.com/posts/priyapatel/14',
    isFlagged: false, isResolved: true, detectedAt: '2026-07-02T20:15:00Z',
    tags: ['Migration', 'Dashboard', 'Efficiency'],
  },
  {
    id: '15', platform: 'Facebook', platformIcon: '📘', author: 'SMB Marketing Group', authorAvatar: '', authorFollowers: 42000,
    content: 'Warning: Calixo pricing increased 30% for our renewal. Small businesses beware - great tool but becoming unaffordable for SMBs.',
    sentiment: 'negative', sentimentScore: 0.22, reach: 31000, engagement: 1400,
    country: 'Australia', language: 'English', url: 'https://facebook.com/groups/smbmarketing/15',
    isFlagged: true, isResolved: false, detectedAt: '2026-07-02T16:00:00Z',
    tags: ['Pricing', 'SMB', 'Renewal'],
  },
];

export interface CompetitorData {
  id: string;
  name: string;
  logo: string;
  shareOfVoice: number;
  totalMentions: number;
  reach: number;
  avgSentiment: number;
  engagement: number;
  growth: number;
  topKeywords: string[];
  campaignActivity: number;
}

export const competitorData: CompetitorData[] = [
  { id: '1', name: 'Calixo', logo: 'C', shareOfVoice: 34.2, totalMentions: 48392, reach: 12800000, avgSentiment: 72, engagement: 89000, growth: 18.4, topKeywords: ['AI', 'Automation', 'ROI', 'Enterprise', 'Analytics'], campaignActivity: 85 },
  { id: '2', name: 'MarketMinds', logo: 'M', shareOfVoice: 28.5, totalMentions: 40200, reach: 10200000, avgSentiment: 68, engagement: 72000, growth: 12.1, topKeywords: ['Analytics', 'Dashboard', 'Reporting', 'Social', 'SEO'], campaignActivity: 72 },
  { id: '3', name: 'AdPulse', logo: 'A', shareOfVoice: 18.3, totalMentions: 25800, reach: 7200000, avgSentiment: 65, engagement: 51000, growth: 8.7, topKeywords: ['Ads', 'PPC', 'Retargeting', 'Display', 'Video'], campaignActivity: 68 },
  { id: '4', name: 'BrandFlow', logo: 'B', shareOfVoice: 12.1, totalMentions: 17100, reach: 5100000, avgSentiment: 71, engagement: 38000, growth: 15.2, topKeywords: ['Brand', 'Creative', 'Design', 'Content', 'Social'], campaignActivity: 55 },
  { id: '5', name: 'GrowthStack', logo: 'G', shareOfVoice: 6.9, totalMentions: 9800, reach: 3100000, avgSentiment: 59, engagement: 19000, growth: 4.3, topKeywords: ['Growth', 'SEO', 'Content', 'Email', 'CRM'], campaignActivity: 42 },
];

export interface ShareOfVoiceTimeline {
  date: string;
  Calixo: number;
  MarketMinds: number;
  AdPulse: number;
  BrandFlow: number;
  GrowthStack: number;
}

export const shareOfVoiceTimeline: ShareOfVoiceTimeline[] = [
  { date: 'Jan', Calixo: 28, MarketMinds: 30, AdPulse: 22, BrandFlow: 13, GrowthStack: 7 },
  { date: 'Feb', Calixo: 29, MarketMinds: 29, AdPulse: 21, BrandFlow: 13, GrowthStack: 8 },
  { date: 'Mar', Calixo: 31, MarketMinds: 28, AdPulse: 20, BrandFlow: 13, GrowthStack: 8 },
  { date: 'Apr', Calixo: 32, MarketMinds: 28, AdPulse: 19, BrandFlow: 12, GrowthStack: 9 },
  { date: 'May', Calixo: 33, MarketMinds: 29, AdPulse: 19, BrandFlow: 12, GrowthStack: 7 },
  { date: 'Jun', Calixo: 34, MarketMinds: 28, AdPulse: 18, BrandFlow: 12, GrowthStack: 7 },
  { date: 'Jul', Calixo: 34.2, MarketMinds: 28.5, AdPulse: 18.3, BrandFlow: 12.1, GrowthStack: 6.9 },
];

export interface TrendingTopic {
  id: string;
  topic: string;
  volume: number;
  growth: number;
  sentiment: number;
  relatedTopics: string[];
  firstDetected: string;
  peak: string;
}

export const trendingTopics: TrendingTopic[] = [
  { id: '1', topic: 'AI-Powered Campaign Optimization', volume: 12500, growth: 245, sentiment: 85, relatedTopics: ['Machine Learning', 'Automation', 'ROI'], firstDetected: '2026-06-15', peak: '2026-07-02' },
  { id: '2', topic: 'Multi-Channel Attribution', volume: 8900, growth: 180, sentiment: 72, relatedTopics: ['Analytics', 'Tracking', 'Conversion'], firstDetected: '2026-06-20', peak: '2026-07-03' },
  { id: '3', topic: 'Privacy-First Marketing', volume: 7200, growth: 156, sentiment: 68, relatedTopics: ['GDPR', 'Cookieless', 'First-Party Data'], firstDetected: '2026-06-10', peak: '2026-07-01' },
  { id: '4', topic: 'Generative AI Content', volume: 6800, growth: 210, sentiment: 78, relatedTopics: ['ChatGPT', 'DALL-E', 'Content Creation'], firstDetected: '2026-06-05', peak: '2026-06-28' },
  { id: '5', topic: 'Social Commerce Integration', volume: 5400, growth: 135, sentiment: 82, relatedTopics: ['Instagram Shop', 'TikTok Shop', 'Live Shopping'], firstDetected: '2026-06-18', peak: '2026-07-02' },
  { id: '6', topic: 'Marketing Automation ROI', volume: 4800, growth: 95, sentiment: 76, relatedTopics: ['Workflow', 'Efficiency', 'Cost Savings'], firstDetected: '2026-06-22', peak: '2026-07-04' },
  { id: '7', topic: 'Video-First Marketing Strategy', volume: 4200, growth: 88, sentiment: 80, relatedTopics: ['YouTube', 'TikTok', 'Short-Form'], firstDetected: '2026-06-12', peak: '2026-06-30' },
  { id: '8', topic: 'B2B Influencer Marketing', volume: 3600, growth: 72, sentiment: 70, relatedTopics: ['LinkedIn', 'Thought Leadership', 'Enterprise'], firstDetected: '2026-06-25', peak: '2026-07-03' },
];

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  mentionCount: number;
  reach: number;
  riskScore: number;
  detectedAt: string;
  isResolved: boolean;
  recommendedAction: string;
}

export const crisisAlerts: CrisisAlert[] = [
  {
    id: '1', title: 'Pricing Backlash on Social Media', severity: 'warning',
    description: 'Multiple negative mentions about recent pricing changes detected across Twitter and Facebook. Sentiment dropping rapidly in SMB segment.',
    source: 'Twitter/X, Facebook', mentionCount: 45, reach: 120000, riskScore: 72,
    detectedAt: '2026-07-03T14:00:00Z', isResolved: false,
    recommendedAction: 'Issue public statement addressing SMB pricing concerns. Consider introducing a SMB-friendly tier. Respond to top 10 most viral negative posts.',
  },
  {
    id: '2', title: 'API Rate Limiting Complaints Surge', severity: 'warning',
    description: 'Developer community reporting aggressive API rate limiting. Mentions up 340% in 48 hours. Risk of developer churn.',
    source: 'Reddit, Twitter/X, GitHub', mentionCount: 32, reach: 85000, riskScore: 65,
    detectedAt: '2026-07-03T18:00:00Z', isResolved: false,
    recommendedAction: 'Review API rate limit thresholds. Publish updated rate limit documentation. Engage with developer community on Reddit and GitHub.',
  },
  {
    id: '3', title: 'Billing Double-Charge Incident', severity: 'critical',
    description: 'Enterprise customer reports being double-charged. Support response time 4 days. Risk of churn and negative PR.',
    source: 'Twitter/X, Support Ticket', mentionCount: 8, reach: 45000, riskScore: 85,
    detectedAt: '2026-07-04T07:30:00Z', isResolved: false,
    recommendedAction: 'Immediately refund double charge. Escalate to VP Customer Success. Personal outreach from account manager. Audit billing system for similar issues.',
  },
  {
    id: '4', title: 'Competitor Launching AI Features', severity: 'info',
    description: 'MarketMinds announced new AI-powered analytics suite. Early reviews positive. Potential loss of competitive advantage.',
    source: 'LinkedIn, Tech Blogs', mentionCount: 120, reach: 350000, riskScore: 45,
    detectedAt: '2026-07-02T10:00:00Z', isResolved: true,
    recommendedAction: 'Accelerate AI feature roadmap. Publish competitive comparison. Highlight Calixo unique AI capabilities in next marketing campaign.',
  },
];

export interface AiInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'summary';
  title: string;
  content: string;
  confidence: number;
  relatedData: string[];
  generatedAt: string;
}

export const aiInsights: AiInsight[] = [
  {
    id: '1', type: 'summary', title: 'Weekly Executive Summary',
    content: 'Brand health remains strong at 87.4 with 18.4% growth in total mentions. Share of voice increased to 34.2%, solidifying market leadership. Key concern: pricing sentiment declining among SMB segment (-8% week-over-week). Positive signals: enterprise segment showing record satisfaction scores (92% positive sentiment). AI feature mentions up 245%, indicating strong market positioning. Recommendation: address SMB pricing concerns before they impact overall brand perception.',
    confidence: 0.94, relatedData: ['brandKpis', 'sentimentTimeline', 'keywordCloud'],
    generatedAt: '2026-07-04T10:00:00Z',
  },
  {
    id: '2', type: 'opportunity', title: 'Enterprise Expansion Opportunity',
    content: 'Enterprise segment mentions show 92% positive sentiment with keywords focused on security, compliance, and scalability. Enterprise deals closing 40% faster than Q1. Three Fortune 500 companies actively evaluating Calixo. Recommended action: Create enterprise-specific content highlighting SOC2, GDPR, and HIPAA compliance. Target LinkedIn with enterprise case studies.',
    confidence: 0.88, relatedData: ['sentimentTimeline', 'platformDistribution', 'keywordCloud'],
    generatedAt: '2026-07-04T09:30:00Z',
  },
  {
    id: '3', type: 'risk', title: 'SMB Segment Price Sensitivity',
    content: 'Negative sentiment in SMB segment increased 30% following pricing changes. Key complaints: 30% price increase at renewal, lack of affordable tier for small teams. Competitors actively targeting this segment with lower-cost alternatives. Projected churn risk: 15% of SMB customers in next 90 days if unaddressed. Revenue impact: approximately $2.4M annual recurring revenue at risk.',
    confidence: 0.91, relatedData: ['brandMentions', 'sentimentTimeline', 'competitorData'],
    generatedAt: '2026-07-04T09:00:00Z',
  },
  {
    id: '4', type: 'recommendation', title: 'API Developer Relations Strategy',
    content: 'Developer community sentiment dropped 40% due to API rate limiting issues. However, API usage grew 180% YoY indicating strong demand. Recommended: 1) Immediately increase rate limits for verified developers, 2) Launch developer portal with improved documentation, 3) Create developer advocate role, 4) Start developer community program with early access to new APIs.',
    confidence: 0.86, relatedData: ['brandMentions', 'platformDistribution', 'trendingTopics'],
    generatedAt: '2026-07-04T08:30:00Z',
  },
  {
    id: '5', type: 'opportunity', title: 'AI Content Generation Market',
    content: 'Generative AI content mentions up 210% across all platforms. Calixo mentioned in 34% of these conversations as a leading platform. Competitors yet to match Calixo AI content capabilities. Market size for AI content tools projected to reach $12B by 2027. Recommended: Launch dedicated AI Content Studio campaign, showcase customer success stories, partner with content marketing influencers.',
    confidence: 0.83, relatedData: ['trendingTopics', 'keywordCloud', 'competitorData'],
    generatedAt: '2026-07-04T08:00:00Z',
  },
];

export interface BrandReport {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'executive';
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  format: 'PDF' | 'CSV' | 'Excel';
  size: string;
  status: 'ready' | 'generating' | 'scheduled';
}

export const brandReports: BrandReport[] = [
  { id: '1', name: 'Weekly Brand Health Report', type: 'weekly', description: 'Week-over-week brand health metrics, sentiment trends, and top mentions', lastGenerated: '2026-07-04', nextScheduled: '2026-07-11', format: 'PDF', size: '2.4 MB', status: 'ready' },
  { id: '2', name: 'Monthly Competitive Analysis', type: 'monthly', description: 'Detailed competitive landscape analysis with share of voice and market positioning', lastGenerated: '2026-07-01', nextScheduled: '2026-08-01', format: 'PDF', size: '5.1 MB', status: 'ready' },
  { id: '3', name: 'Q3 Quarterly Brand Review', type: 'quarterly', description: 'Comprehensive quarterly brand performance review with executive summary', lastGenerated: '2026-07-01', nextScheduled: '2026-10-01', format: 'PDF', size: '8.7 MB', status: 'ready' },
  { id: '4', name: 'Executive Brand Dashboard', type: 'executive', description: 'Executive summary with key KPIs, risks, and strategic recommendations', lastGenerated: '2026-07-04', nextScheduled: '2026-07-11', format: 'PDF', size: '1.8 MB', status: 'ready' },
  { id: '5', name: 'Sentiment Analysis Deep Dive', type: 'weekly', description: 'Detailed sentiment analysis by platform, country, and demographic', lastGenerated: '2026-07-03', nextScheduled: '2026-07-10', format: 'Excel', size: '3.2 MB', status: 'ready' },
  { id: '6', name: 'Competitor Campaign Tracker', type: 'monthly', description: 'Track competitor campaign activities, budgets, and performance estimates', lastGenerated: '2026-06-28', nextScheduled: '2026-07-28', format: 'CSV', size: '1.5 MB', status: 'ready' },
];

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'mention_spike' | 'sentiment_drop' | 'competitor_activity' | 'crisis_detection' | 'keyword_match';
  enabled: boolean;
  threshold: string;
  channels: string[];
  createdAt: string;
}

export const alertRules: AlertRule[] = [
  { id: '1', name: 'Negative Sentiment Spike', description: 'Alert when negative sentiment increases by 20%+ in 1 hour', type: 'sentiment_drop', enabled: true, threshold: '20% increase in 1 hour', channels: ['email', 'in_app', 'slack'], createdAt: '2026-06-01' },
  { id: '2', name: 'Viral Mention Alert', description: 'Alert when a mention reaches 10K+ engagement', type: 'mention_spike', enabled: true, threshold: '10,000 engagements', channels: ['email', 'in_app', 'push'], createdAt: '2026-06-01' },
  { id: '3', name: 'Competitor Campaign Launch', description: 'Alert when competitors launch new campaigns or features', type: 'competitor_activity', enabled: true, threshold: 'New campaign detected', channels: ['email', 'in_app'], createdAt: '2026-06-05' },
  { id: '4', name: 'Crisis Detection', description: 'Alert when risk score exceeds 70 with critical keywords', type: 'crisis_detection', enabled: true, threshold: 'Risk score > 70', channels: ['email', 'in_app', 'slack', 'sms'], createdAt: '2026-06-01' },
  { id: '5', name: 'Pricing Discussion Alert', description: 'Track all pricing-related mentions for sentiment analysis', type: 'keyword_match', enabled: true, threshold: 'Any mention with pricing keywords', channels: ['in_app'], createdAt: '2026-06-10' },
];

export interface BrandSettings {
  trackedKeywords: string[];
  trackedCompetitors: string[];
  trackedLanguages: string[];
  trackedCountries: string[];
  trackedSources: string[];
  alertThresholds: { mentionSpike: number; sentimentDrop: number; crisisScore: number };
}

export const brandSettings: BrandSettings = {
  trackedKeywords: ['Calixo', 'AI Marketing', 'Campaign Automation', 'Marketing Analytics', 'Ad Platform'],
  trackedCompetitors: ['MarketMinds', 'AdPulse', 'BrandFlow', 'GrowthStack'],
  trackedLanguages: ['English', 'Spanish', 'German', 'French', 'Japanese', 'Portuguese'],
  trackedCountries: ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Brazil', 'France', 'Japan'],
  trackedSources: ['Twitter/X', 'LinkedIn', 'Instagram', 'Facebook', 'Reddit', 'YouTube', 'News/Blogs', 'Forums'],
  alertThresholds: { mentionSpike: 200, sentimentDrop: 15, crisisScore: 65 },
};