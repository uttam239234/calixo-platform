import type { SocialState } from "./types";

export const initialSocialState: SocialState = {
  accounts: [
    { id:"facebook", platform:"Facebook", handle:"@calixo.global", color:"#1877F2", shortName:"f", status:"Connected", followers:84200, engagementRate:3.8, posts:126, reach:624000, lastSync:"2 min ago" },
    { id:"instagram", platform:"Instagram", handle:"@calixo", color:"#E1306C", shortName:"IG", status:"Connected", followers:128400, engagementRate:5.6, posts:214, reach:1180000, lastSync:"4 min ago" },
    { id:"linkedin", platform:"LinkedIn", handle:"Calixo", color:"#0A66C2", shortName:"in", status:"Connected", followers:46700, engagementRate:4.2, posts:98, reach:386000, lastSync:"7 min ago" },
    { id:"x", platform:"X", handle:"@calixohq", color:"#E2E8F0", shortName:"X", status:"Connected", followers:39100, engagementRate:2.9, posts:342, reach:412000, lastSync:"11 min ago" },
    { id:"tiktok", platform:"TikTok", handle:"@calixo.ai", color:"#F472B6", shortName:"TT", status:"Needs attention", followers:76300, engagementRate:7.4, posts:87, reach:964000, lastSync:"1 hr ago" },
    { id:"youtube", platform:"YouTube", handle:"@CalixoOfficial", color:"#FF0033", shortName:"YT", status:"Disconnected", followers:21800, engagementRate:4.8, posts:64, reach:294000, lastSync:"3 days ago" },
  ],
  posts: [
    { id:"post-1", platform:"Instagram", accountId:"instagram", content:"Five signals your growth strategy is ready for an AI upgrade.", status:"Published", publishedAt:"Today, 9:30 AM", likes:2840, comments:186, shares:412, reach:48600 },
    { id:"post-2", platform:"LinkedIn", accountId:"linkedin", content:"The 2026 Marketing Intelligence Report is here — with insights from 400+ teams.", status:"Published", publishedAt:"Yesterday, 2:15 PM", likes:1260, comments:94, shares:228, reach:31200 },
    { id:"post-3", platform:"TikTok", accountId:"tiktok", content:"POV: your campaign reporting finally takes seconds, not hours.", status:"Scheduled", publishedAt:"Today, 6:00 PM", likes:0, comments:0, shares:0, reach:0 },
    { id:"post-4", platform:"Facebook", accountId:"facebook", content:"Join our live workshop: building a connected marketing operating system.", status:"Scheduled", publishedAt:"Jul 5, 11:00 AM", likes:0, comments:0, shares:0, reach:0 },
    { id:"post-5", platform:"X", accountId:"x", content:"Great marketing compounds when every channel learns from the others.", status:"Draft", publishedAt:"Not scheduled", likes:0, comments:0, shares:0, reach:0 },
    { id:"post-6", platform:"YouTube", accountId:"youtube", content:"Calixo product walkthrough: from insight to campaign in one workspace.", status:"Draft", publishedAt:"Not scheduled", likes:0, comments:0, shares:0, reach:0 },
  ],
  recommendations: [
    { id:"rec-1", title:"Post Instagram carousel at 7:30 PM", description:"Your audience is 32% more active during this window on Thursdays.", impact:"High", category:"Timing", applied:false },
    { id:"rec-2", title:"Repurpose the AI report for LinkedIn", description:"A five-slide document post could extend reach by an estimated 18K impressions.", impact:"High", category:"Content", applied:false },
    { id:"rec-3", title:"Reply to 24 high-intent comments", description:"These conversations contain product and pricing questions worth prioritizing.", impact:"Medium", category:"Engagement", applied:false },
    { id:"rec-4", title:"Reconnect YouTube", description:"Restore the channel connection to resume publishing and performance tracking.", impact:"Medium", category:"Growth", applied:false },
  ],
};
