export type ComposerPlatform = "Facebook" | "Instagram" | "LinkedIn" | "X" | "Threads" | "Pinterest" | "YouTube Community" | "TikTok";
export type AudienceType = "Public" | "Followers" | "Custom Audience" | "Close Friends";
export type PublishingMode = "now" | "schedule" | "draft";
export type RecurringFrequency = "Daily" | "Weekly" | "Monthly";
export type AiAction = "generate" | "rewrite" | "professional" | "friendly" | "promotional" | "shorten" | "expand" | "grammar" | "hashtags" | "cta" | "translate" | "summarize";
export interface ComposerMedia { id:string; name:string; type:"image"|"video"; dataUrl:string; }
export interface ComposerDraft { id:string; title:string; platforms:ComposerPlatform[]; content:string; media:ComposerMedia[]; audience:AudienceType; customAudience:string; publishingMode:PublishingMode; scheduledDate:string; scheduledTime:string; timezone:string; recurring:boolean; recurringFrequency:RecurringFrequency; previewPlatform:ComposerPlatform; updatedAt:string; }
export interface PlatformConfig { name:ComposerPlatform; shortName:string; color:string; limit:number; requiresMedia:boolean; }
