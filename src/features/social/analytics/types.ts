export type AnalyticsPlatform="Facebook"|"Instagram"|"LinkedIn"|"X"|"TikTok"|"Pinterest"|"Threads"|"YouTube";
export interface SocialAnalyticsFilters{platform:string;date:"7d"|"30d"|"90d";campaign:string;postType:string;author:string;}
export interface PlatformMetric{platform:AnalyticsPlatform;color:string;followers:number;reach:number;engagement:number;posts:number;growth:number;}
export interface DailySocialMetric{date:string;label:string;reach:number;engagement:number;followers:number;impressions:number;}
export interface SocialPostMetric{id:string;platform:AnalyticsPlatform;caption:string;thumbnail:string;reach:number;engagement:number;likes:number;comments:number;shares:number;clicks:number;ctr:number;campaign:string;postType:string;author:string;date:string;}
export interface HashtagMetric{tag:string;reach:number;engagement:number;rank:number;suggestion:string;}
export interface CampaignSocialMetric{name:string;posts:number;reach:number;engagement:number;clicks:number;growth:number;}
export interface AnalyticsOverview{followers:number;reach:number;impressions:number;engagement:number;likes:number;comments:number;shares:number;clicks:number;ctr:number;growth:number;}
