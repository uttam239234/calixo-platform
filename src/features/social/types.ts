export type SocialPlatform = "Facebook" | "Instagram" | "LinkedIn" | "X" | "TikTok" | "YouTube" | "Threads" | "Pinterest" | "YouTube Community";
export type SocialAccountStatus = "Connected" | "Disconnected" | "Needs attention";
export type SocialPostStatus = "Published" | "Scheduled" | "Draft";

export interface SocialAccount { id: string; platform: SocialPlatform; handle: string; color: string; shortName: string; status: SocialAccountStatus; followers: number; engagementRate: number; posts: number; reach: number; lastSync: string; }
export interface SocialPost { id: string; platform: SocialPlatform; accountId: string; content: string; status: SocialPostStatus; publishedAt: string; likes: number; comments: number; shares: number; reach: number; }
export interface SocialRecommendation { id: string; title: string; description: string; impact: "High" | "Medium"; category: "Content" | "Timing" | "Engagement" | "Growth"; applied: boolean; }
export interface SocialState { accounts: SocialAccount[]; posts: SocialPost[]; recommendations: SocialRecommendation[]; }
