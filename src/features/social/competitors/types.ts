export type CompetitorPlatform = "Facebook" | "Instagram" | "LinkedIn" | "X" | "TikTok" | "YouTube" | "Pinterest" | "Threads";

export interface CompetitorMetrics {
  followers: number;
  growth: number;
  engagement: number;
  reach: number;
  posts: number;
  videos: number;
  reels: number;
  stories: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  postingFrequency: number;
  responseTime: number;
}

export interface CompetitorContent {
  id: string;
  caption: string;
  platform: CompetitorPlatform;
  engagement: number;
  reach: number;
  views: number;
  type: "Image" | "Video" | "Carousel" | "Text" | "Story" | "Reel" | "Short";
  thumbnail: string;
  likes?: number;
  comments?: number;
  shares?: number;
  date?: string;
}

export interface CompetitorHashtag {
  tag: string;
  frequency: number;
  reach: number;
  trend: number;
  engagement?: number;
  recommendation?: string;
}

export interface CompetitorAudience {
  countries: string[];
  cities: string[];
  age: string;
  gender: string;
  language: string;
  devices: string;
}

export interface CompetitorTimelineItem {
  id: string;
  label: string;
  date: string;
  type: "growth" | "content" | "campaign";
}

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: CompetitorPlatform;
  industry: string;
  country: string;
  color: string;
  favorite: boolean;
  metrics: CompetitorMetrics;
  topContent: CompetitorContent[];
  hashtags: CompetitorHashtag[];
  audience: CompetitorAudience;
  timeline: CompetitorTimelineItem[];
  description?: string;
  website?: string;
  joinedDate?: string;
}

export interface CompetitorInput {
  name: string;
  handle: string;
  platform: CompetitorPlatform;
  industry: string;
  country: string;
  followers: number;
  engagement: number;
}

export interface CompetitorFiltersState {
  platform: string;
  industry: string;
  followers: string;
  engagement: string;
  country: string;
}

export type ComparisonMetric =
  | "followers"
  | "reach"
  | "engagement"
  | "growth"
  | "postingFrequency"
  | "views"
  | "shares"
  | "likes"
  | "comments"
  | "ctr";

export interface ComparisonData {
  competitorId: string;
  competitorName: string;
  competitorColor: string;
  values: Record<ComparisonMetric, number>;
}

export interface BenchmarkResult {
  category: string;
  yourBrand: number;
  competitors: { id: string; name: string; value: number; color: string }[];
  rank: number;
  total: number;
  difference: number;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  volume: number;
  growth: number;
  platform: CompetitorPlatform;
  sentiment: "positive" | "neutral" | "negative";
}

export interface TrendingFormat {
  id: string;
  format: string;
  growth: number;
  engagement: number;
  platform: CompetitorPlatform;
}

export interface PostingTimeInsight {
  id: string;
  day: string;
  time: string;
  engagement: number;
  platform: CompetitorPlatform;
}

export interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  potential: number;
  effort: "Low" | "Medium" | "High";
  relevance: number;
}

export interface TrendAnalysisData {
  topics: TrendingTopic[];
  formats: TrendingFormat[];
  postingTimes: PostingTimeInsight[];
  opportunities: ContentOpportunity[];
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  businessImpact: string;
  suggestedAction: string;
  category: string;
  applied?: boolean;
}

export interface BrandMetrics {
  followers: number;
  growth: number;
  engagement: number;
  reach: number;
  posts: number;
  views: number;
  shares: number;
  likes: number;
  comments: number;
  postingFrequency: number;
  ctr: number;
  name: string;
  color: string;
}

export interface CompetitorContextValue {
  competitors: Competitor[];
  visibleCompetitors: Competitor[];
  compared: Competitor[];
  compareIds: string[];
  query: string;
  filters: CompetitorFiltersState;
  dialogOpen: boolean;
  editingCompetitor: Competitor | null;
  aiVersion: number;
  brandMetrics: BrandMetrics;
  trendData: TrendAnalysisData;
  recommendations: AIRecommendation[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  setQuery: (value: string) => void;
  setFilters: (value: CompetitorFiltersState) => void;
  resetFilters: () => void;
  openAdd: () => void;
  openEdit: (id: string) => void;
  closeDialog: () => void;
  saveCompetitor: (input: CompetitorInput, id?: string) => void;
  removeCompetitor: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  refreshAi: () => void;
  showToast: (message: string) => void;
  exportData: (format: "csv" | "excel" | "pdf") => void;
  applyRecommendation: (id: string) => void;
  dismissRecommendation: (id: string) => void;
}