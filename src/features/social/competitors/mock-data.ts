import type {
  Competitor,
  CompetitorPlatform,
  BrandMetrics,
  TrendAnalysisData,
  AIRecommendation,
} from "./types";

const names = [
  "NovaReach",
  "GrowthPilot",
  "SocialForge",
  "BrandFlow",
  "MarketNest",
  "CreatorLoop",
  "SignalWorks",
  "PulseStack",
];
const handles = [
  "@novareach",
  "@growthpilot",
  "@socialforge",
  "@brandflowhq",
  "@marketnest",
  "@creatorloop",
  "@signalworks",
  "@pulsestack",
];
const platforms: CompetitorPlatform[] = [
  "Instagram",
  "LinkedIn",
  "Facebook",
  "X",
  "TikTok",
  "YouTube",
  "Pinterest",
  "Threads",
];
const industries = [
  "Marketing Technology",
  "SaaS",
  "Digital Agency",
  "Social Media",
  "Creator Economy",
  "Analytics",
  "E-commerce",
  "AI Software",
];
const countries = [
  "United States",
  "India",
  "United Kingdom",
  "Singapore",
  "Canada",
  "Germany",
  "Australia",
  "France",
];
const colors = [
  "#8b5cf6",
  "#22d3ee",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#ef4444",
  "#0ea5e9",
  "#e2e8f0",
];
const descriptions = [
  "Leading marketing technology platform with AI-driven campaign optimization.",
  "Growth-focused SaaS provider specializing in social media automation.",
  "Full-service digital agency with expertise in brand strategy and content.",
  "Social media management platform for enterprise teams.",
  "Creator economy marketplace connecting brands with influencers.",
  "Analytics-first platform for data-driven social media decisions.",
  "E-commerce social selling platform with integrated shopping.",
  "AI-powered social media optimization and content generation.",
];
const websites = [
  "novareach.io",
  "growthpilot.com",
  "socialforge.co",
  "brandflowhq.com",
  "marketnest.io",
  "creatorloop.app",
  "signalworks.com",
  "pulsestack.ai",
];

export const initialCompetitors: Competitor[] = names.map((name, index) => {
  const followers = 186000 - index * 11700 + (index % 2) * 42000;
  const engagement = 7.8 - index * 0.48;
  const reach = 920000 - index * 63000;
  return {
    id: `competitor-${index + 1}`,
    name,
    handle: handles[index],
    platform: platforms[index],
    industry: industries[index],
    country: countries[index],
    color: colors[index],
    favorite: index < 3,
    description: descriptions[index],
    website: websites[index],
    joinedDate: new Date(
      Date.now() - (index + 12) * 30 * 86400000
    ).toISOString(),
    metrics: {
      followers,
      growth: 14.2 - index * 1.05,
      engagement,
      reach,
      posts: 184 - index * 11,
      videos: 62 - index * 3,
      reels: 48 - index * 2,
      stories: 96 - index * 5,
      likes: 148000 - index * 9400,
      comments: 18600 - index * 970,
      shares: 24200 - index * 1140,
      views: 2180000 - index * 137000,
      postingFrequency: 6.8 - index * 0.45,
      responseTime: 1.2 + index * 0.55,
    },
    topContent: Array.from(
      { length: 4 },
      (_, contentIndex) => {
        const captions = [
          "The playbook behind our fastest-growing social campaigns.",
          "Five audience signals every modern team should track.",
          "How high-growth brands turn content into customer momentum.",
          "Our Q2 content strategy breakdown and key takeaways.",
        ];
        const types: ("Carousel" | "Video" | "Image" | "Reel" | "Short")[] = [
          "Carousel",
          "Video",
          "Image",
          index % 2 === 0 ? "Reel" : "Short",
        ];
        return {
          id: `competitor-${index + 1}-content-${contentIndex + 1}`,
          caption: captions[contentIndex],
          platform: platforms[index],
          engagement: Math.round(
            9200 - index * 440 - contentIndex * 830
          ),
          reach: Math.round(reach * 0.24 - contentIndex * 31000),
          views: Math.round(reach * 0.36 - contentIndex * 42000),
          type: types[contentIndex],
          thumbnail: `${name.slice(0, 2).toUpperCase()}${contentIndex + 1}`,
          likes: Math.round(4800 - index * 220 - contentIndex * 400),
          comments: Math.round(620 - index * 30 - contentIndex * 55),
          shares: Math.round(1100 - index * 50 - contentIndex * 90),
          date: new Date(
            Date.now() - (index + contentIndex) * 3 * 86400000
          ).toISOString(),
        };
      }
    ),
    hashtags: [
      "#MarketingAI",
      "#SocialStrategy",
      "#GrowthMarketing",
      "#ContentInsights",
    ].map((tag, tagIndex) => ({
      tag,
      frequency: 28 - index * 2 - tagIndex * 3,
      reach: 284000 - index * 14000 - tagIndex * 27000,
      trend: 18 - index - tagIndex * 2,
      engagement: 4.2 - index * 0.15 - tagIndex * 0.3,
      recommendation:
        tagIndex === 0
          ? "High relevance — consider co-creation opportunities."
          : tagIndex === 1
          ? "Strong growth signal — monitor for content inspiration."
          : tagIndex === 2
          ? "Moderate overlap — evaluate for joint campaigns."
          : "Emerging tag — early adoption opportunity.",
    })),
    audience: {
      countries: [countries[index], "United States", "United Kingdom"],
      cities: ["New York", "London", "Bengaluru"],
      age: "25–34 · 38%",
      gender: "Women 52% · Men 46%",
      language: "English · 76%",
      devices: "Mobile · 81%",
    },
    timeline: [
      {
        id: `timeline-${index}-1`,
        label: "Follower milestone reached",
        date: new Date(
          Date.now() - (index + 2) * 86400000
        ).toISOString(),
        type: "growth",
      },
      {
        id: `timeline-${index}-2`,
        label: "High-performing content series launched",
        date: new Date(
          Date.now() - (index + 8) * 86400000
        ).toISOString(),
        type: "content",
      },
      {
        id: `timeline-${index}-3`,
        label: "New awareness campaign detected",
        date: new Date(
          Date.now() - (index + 16) * 86400000
        ).toISOString(),
        type: "campaign",
      },
    ],
  };
});

export const brandMetrics: BrandMetrics = {
  name: "Your Brand",
  color: "#22d3ee",
  followers: 245000,
  growth: 18.5,
  engagement: 8.2,
  reach: 1250000,
  posts: 245,
  views: 3200000,
  shares: 38500,
  likes: 210000,
  comments: 28500,
  postingFrequency: 8.5,
  ctr: 3.8,
};

export const trendData: TrendAnalysisData = {
  topics: [
    {
      id: "topic-1",
      topic: "AI-Powered Content Creation",
      volume: 84500,
      growth: 42,
      platform: "LinkedIn",
      sentiment: "positive",
    },
    {
      id: "topic-2",
      topic: "Authentic Brand Storytelling",
      volume: 62300,
      growth: 28,
      platform: "Instagram",
      sentiment: "positive",
    },
    {
      id: "topic-3",
      topic: "Short-Form Video Strategy",
      volume: 128000,
      growth: 67,
      platform: "TikTok",
      sentiment: "positive",
    },
    {
      id: "topic-4",
      topic: "Community-Led Growth",
      volume: 41200,
      growth: 35,
      platform: "X",
      sentiment: "neutral",
    },
    {
      id: "topic-5",
      topic: "Social Commerce Integration",
      volume: 51300,
      growth: 22,
      platform: "Facebook",
      sentiment: "neutral",
    },
    {
      id: "topic-6",
      topic: "Creator Partnerships",
      volume: 72100,
      growth: 51,
      platform: "YouTube",
      sentiment: "positive",
    },
    {
      id: "topic-7",
      topic: "Data Privacy Concerns",
      volume: 29800,
      growth: -5,
      platform: "Threads",
      sentiment: "negative",
    },
    {
      id: "topic-8",
      topic: "Micro-Influencer Campaigns",
      volume: 38400,
      growth: 45,
      platform: "Pinterest",
      sentiment: "positive",
    },
  ],
  formats: [
    {
      id: "format-1",
      format: "Carousel Posts",
      growth: 34,
      engagement: 12.4,
      platform: "Instagram",
    },
    {
      id: "format-2",
      format: "Short Videos (15-60s)",
      growth: 58,
      engagement: 18.2,
      platform: "TikTok",
    },
    {
      id: "format-3",
      format: "Behind-the-Scenes",
      growth: 22,
      engagement: 9.8,
      platform: "LinkedIn",
    },
    {
      id: "format-4",
      format: "Polls & Interactive",
      growth: 41,
      engagement: 15.6,
      platform: "X",
    },
    {
      id: "format-5",
      format: "Live Streams",
      growth: 27,
      engagement: 21.3,
      platform: "YouTube",
    },
    {
      id: "format-6",
      format: "Idea Pins",
      growth: 45,
      engagement: 11.7,
      platform: "Pinterest",
    },
  ],
  postingTimes: [
    {
      id: "time-1",
      day: "Tuesday",
      time: "10:00 AM",
      engagement: 14.2,
      platform: "Instagram",
    },
    {
      id: "time-2",
      day: "Wednesday",
      time: "12:00 PM",
      engagement: 13.8,
      platform: "LinkedIn",
    },
    {
      id: "time-3",
      day: "Thursday",
      time: "7:00 PM",
      engagement: 16.5,
      platform: "TikTok",
    },
    {
      id: "time-4",
      day: "Monday",
      time: "9:00 AM",
      engagement: 11.9,
      platform: "Facebook",
    },
    {
      id: "time-5",
      day: "Friday",
      time: "3:00 PM",
      engagement: 12.1,
      platform: "X",
    },
    {
      id: "time-6",
      day: "Saturday",
      time: "11:00 AM",
      engagement: 15.7,
      platform: "YouTube",
    },
  ],
  opportunities: [
    {
      id: "opp-1",
      title: "Short-Form Video Series",
      description:
        "Competitors are gaining traction with daily short-form videos. Launch a branded series to capture share of voice.",
      potential: 92,
      effort: "Medium",
      relevance: 95,
    },
    {
      id: "opp-2",
      title: "AI Tools Topic Cluster",
      description:
        "AI content creation is trending across platforms. Build thought leadership content around marketing AI tools.",
      potential: 88,
      effort: "Low",
      relevance: 91,
    },
    {
      id: "opp-3",
      title: "Creator Partnership Program",
      description:
        "Micro-influencer campaigns show 45% growth. Structured creator partnerships could expand reach significantly.",
      potential: 85,
      effort: "High",
      relevance: 88,
    },
    {
      id: "opp-4",
      title: "Interactive Content",
      description:
        "Polls and interactive posts have 41% higher engagement. Increase interactive content to boost community participation.",
      potential: 79,
      effort: "Low",
      relevance: 86,
    },
    {
      id: "opp-5",
      title: "Behind-the-Scenes Content",
      description:
        "Authentic BTS content drives 22% more engagement on LinkedIn. Share your workflow and team culture.",
      potential: 76,
      effort: "Low",
      relevance: 82,
    },
  ],
};

export const aiRecommendations: AIRecommendation[] = [
  {
    id: "rec-1",
    title: "Close the Instagram Engagement Gap",
    description:
      "Your brand engagement is 8.2% vs. competitor average of 6.4%. Maintain this edge by increasing Reel frequency. Competitors are posting 2.5x more Reels per week.",
    priority: "High",
    confidence: 94,
    businessImpact: "Estimated +18% engagement rate within 30 days",
    suggestedAction:
      "Increase Reel posting frequency from 3x to 5x per week with trending audio",
    category: "Content Strategy",
  },
  {
    id: "rec-2",
    title: "Capitalize on LinkedIn Growth Momentum",
    description:
      "NovaReach grew LinkedIn followers by 68% this quarter using thought leadership content. Your LinkedIn growth of 18.5% trails the top competitor significantly.",
    priority: "Critical",
    confidence: 91,
    businessImpact:
      "Potential to add 15,000+ LinkedIn followers in 60 days",
    suggestedAction:
      "Launch a weekly thought leadership series with data-driven industry insights",
    category: "Growth",
  },
  {
    id: "rec-3",
    title: "Optimize TikTok Posting Schedule",
    description:
      "Trend analysis shows peak TikTok engagement at 7 PM Thursday. Your current posting schedule misses this window. Top competitors have adjusted and seen +22% views.",
    priority: "Medium",
    confidence: 87,
    businessImpact: "Estimated +22% increase in video views",
    suggestedAction:
      "Shift 40% of TikTok posts to Thursday-Friday evening slots",
    category: "Timing",
  },
  {
    id: "rec-4",
    title: "Adopt Competitor Hashtag Strategy",
    description:
      "SocialForge's #MarketingAI hashtag drives 284K reach per use. Your brand is not using this high-performing tag. 3 of top 5 competitors use industry-specific AI hashtags.",
    priority: "High",
    confidence: 89,
    businessImpact: "Potential +35K additional reach per post",
    suggestedAction:
      "Create a branded hashtag set of 5 AI/marketing tags and use consistently",
    category: "Hashtag Strategy",
  },
  {
    id: "rec-5",
    title: "Increase Video Content Mix",
    description:
      "Video content accounts for 62% of top competitor engagement but only 34% of your content mix. Short-form video is the fastest-growing format across all platforms.",
    priority: "Critical",
    confidence: 96,
    businessImpact:
      "Estimated +25% total engagement within 45 days",
    suggestedAction:
      "Increase video content ratio from 34% to 50% with focus on Reels and Shorts",
    category: "Content Mix",
  },
  {
    id: "rec-6",
    title: "Respond Faster to Community",
    description:
      "Average competitor response time is 1.2 hours vs. your 4.5 hours. Faster response correlates with 32% higher engagement and better algorithm favorability.",
    priority: "Medium",
    confidence: 82,
    businessImpact:
      "Improved response time could boost engagement by 15-20%",
    suggestedAction:
      "Implement automated first-response and set SLAs for community management",
    category: "Community",
  },
  {
    id: "rec-7",
    title: "Target Underperforming Platforms",
    description:
      "MarketNest has 89% higher reach on Pinterest than your brand. Pinterest audience growth is up 45% for competitors. This represents an untapped channel opportunity.",
    priority: "Low",
    confidence: 78,
    businessImpact: "Potential to reach 60,000+ new users monthly",
    suggestedAction:
      "Create 10-15 optimized Pinterest pins per week targeting industry keywords",
    category: "Platform Strategy",
  },
  {
    id: "rec-8",
    title: "Leverage Carousel Posts for Higher CTR",
    description:
      "Carousel posts drive 3.2x higher CTR than single-image posts across competitors. Your brand uses carousels for only 12% of posts vs. competitor average of 28%.",
    priority: "High",
    confidence: 93,
    businessImpact: "CTR could increase from 3.8% to 5.5%",
    suggestedAction:
      "Convert 30% of single-image posts to carousel format with clear narrative flow",
    category: "Content Format",
  },
];